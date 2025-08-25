import { randomUUID } from 'crypto';
import { redisClient, pdfQueueEvents, getWaitingJobsCount } from '../queues/pdf.queue.js';
import { ApiError } from '../utils/ApiError.js';

const MAX_TOTAL_PENDING_JOBS = 40;
const RESERVED_LIST_KEY = 'upload_reservations:list';
const RESERVED_META_PREFIX = 'upload_reservation:';
const RESERVATION_TTL_SECONDS = 60 * 60 * 2;
const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000;

let queueEventsBound = false;

function ensureQueueEventsListener() {
  if (!pdfQueueEvents || queueEventsBound) return;
  queueEventsBound = true;

  pdfQueueEvents.on('waiting', async (args) => {
    try {
      const reservationId = await redisClient.lPop(RESERVED_LIST_KEY);
      if (!reservationId) {
        return;
      }
      await redisClient.set(`${RESERVED_META_PREFIX}${reservationId}`, 'transferred', {
        EX: RESERVATION_TTL_SECONDS
      });
    } catch (err) {
      console.error('[uploadLimit] QueueEvents handler error:', err);
    }
  });

  pdfQueueEvents.on('added', async (args) => {
    try {
      const reservationId = await redisClient.lPop(RESERVED_LIST_KEY);
      if (!reservationId) return;
      await redisClient.set(`${RESERVED_META_PREFIX}${reservationId}`, 'transferred', {
        EX: RESERVATION_TTL_SECONDS
      });
      console.log(`[uploadLimit] QueueEvents: transferred reservation (added) ${reservationId}`);
    } catch (err) {
      console.error('[uploadLimit] QueueEvents(add) handler error:', err);
    }
  });
}


export async function uploadLimitMiddleware(req, res, next) {
  try {
    if (!redisClient.isOpen) {
      try {
        await redisClient.connect();
      } catch (err) {}
    }

    ensureQueueEventsListener();

    const queueJobs = await getWaitingJobsCount();

    let reservedCount = 0;
    try {
      reservedCount = (await redisClient.lLen(RESERVED_LIST_KEY)) || 0;
    } catch (err) {
      console.warn('[uploadLimit] Could not read reserved list length:', err);
      reservedCount = 0;
    }

    if (queueJobs + reservedCount >= MAX_TOTAL_PENDING_JOBS) {
      throw new ApiError(429, `Server busy: maximum total pending jobs (${MAX_TOTAL_PENDING_JOBS}) exceeded. Try again later.`);
    }

    const reservationId = randomUUID();
    await redisClient.rPush(RESERVED_LIST_KEY, reservationId);
    await redisClient.set(`${RESERVED_META_PREFIX}${reservationId}`, 'reserved', {
      EX: RESERVATION_TTL_SECONDS
    });

    req._uploadReservationId = reservationId;

    let cleaned = false;
    async function cleanup() {
      if (cleaned) return;
      cleaned = true;

      try {
        const metaKey = `${RESERVED_META_PREFIX}${reservationId}`;
        const metaVal = await redisClient.get(metaKey);

        if (!metaVal) {
          console.log(`[uploadLimit] Reservation ${reservationId} meta missing on cleanup.`);
        } else if (metaVal === 'transferred') {
          await redisClient.del(metaKey);
          console.log(`[uploadLimit] Reservation ${reservationId} already transferred; cleanup done.`);
        } else {
          const removed = await redisClient.lRem(RESERVED_LIST_KEY, 0, reservationId);
          await redisClient.del(metaKey);
          if (removed > 0) {
            console.log(`[uploadLimit] Reservation ${reservationId} released on cleanup (removed=${removed}).`);
          } else {
            console.log(`[uploadLimit] Reservation ${reservationId} not found in list during cleanup (removed=${removed}).`);
          }
        }
      } catch (err) {
        console.error('[uploadLimit] Error releasing reservation on cleanup:', err);
      }

      if (req._reservationTimeout) {
        clearTimeout(req._reservationTimeout);
        req._reservationTimeout = null;
      }
    }

    res.on('finish', cleanup);
    res.on('close', cleanup);
    req.on('aborted', cleanup);

    req._reservationTimeout = setTimeout(async () => {
      console.warn(`[uploadLimit] Reservation ${reservationId} timeout reached, forcing cleanup.`);
      await cleanup();
    }, RESERVATION_TIMEOUT_MS);

    next();
  } catch (err) {
    next(err);
  }
}
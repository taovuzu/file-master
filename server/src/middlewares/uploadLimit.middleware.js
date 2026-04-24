import { randomUUID } from 'crypto';
import redis from '../db/redis.js';
import { pdfQueueEvents, getWaitingJobsCount } from '../queues/pdf.queue.js';
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
      const reservationId = await redis.lpop(RESERVED_LIST_KEY);
      if (!reservationId) return;
      await redis.set(`${RESERVED_META_PREFIX}${reservationId}`, 'transferred', 'EX', RESERVATION_TTL_SECONDS);
    } catch (err) {
    }
  });

  pdfQueueEvents.on('added', async (args) => {
    try {
      const reservationId = await redis.lpop(RESERVED_LIST_KEY);
      if (!reservationId) return;
      await redis.set(`${RESERVED_META_PREFIX}${reservationId}`, 'transferred', 'EX', RESERVATION_TTL_SECONDS);
    } catch (err) {
    }
  });
}

export async function uploadLimitMiddleware(req, res, next) {
  try {
    ensureQueueEventsListener();

    const queueJobs = await getWaitingJobsCount();

    let reservedCount = 0;
    try {
      reservedCount = (await redis.llen(RESERVED_LIST_KEY)) || 0;
    } catch (err) {
      reservedCount = 0;
    }
    if (queueJobs + reservedCount >= MAX_TOTAL_PENDING_JOBS) {
      throw new ApiError(429, `Server busy: maximum total pending jobs (${MAX_TOTAL_PENDING_JOBS}) exceeded. Try again later.`);
    }
    const reservationId = randomUUID();
    await redis.rpush(RESERVED_LIST_KEY, reservationId);
    await redis.set(`${RESERVED_META_PREFIX}${reservationId}`, 'reserved', 'EX', RESERVATION_TTL_SECONDS);

    req._uploadReservationId = reservationId;

    let cleaned = false;
    async function cleanup() {
      if (cleaned) return;
      cleaned = true;

      try {
        const metaKey = `${RESERVED_META_PREFIX}${reservationId}`;
        const metaVal = await redis.get(metaKey);

        if (!metaVal) {
        } else if (metaVal === 'transferred') {
          await redis.del(metaKey);
        } else {
          const removed = await redis.lrem(RESERVED_LIST_KEY, 0, reservationId);
          await redis.del(metaKey);
        }
      } catch (err) {
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
      await cleanup();
    }, RESERVATION_TIMEOUT_MS);

    next();
  } catch (err) {
    next(err);
  }
}
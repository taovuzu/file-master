import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { SHARED_BASE_DIR, SHARED_UPLOADS_PATH, SHARED_PROCESSED_PATH } from '../constants.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cleanupTargets = [
{ path: SHARED_UPLOADS_PATH, maxAge: 1 * 60 * 1000 },
{ path: join(SHARED_BASE_DIR, 'temp'), maxAge: 1 * 60 * 1000 },
{ path: SHARED_PROCESSED_PATH, maxAge: 5 * 60 * 1000 }];


const excludedDirs = ['important-job', 'do-not-delete', 'uploads'];
let isCleaning = false;

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function cleanupDirectory(dirPath, maxAge) {
  try {
    const entries = await fs.readdir(dirPath);
    const now = Date.now();

    for (const entry of entries) {
      if (excludedDirs.includes(entry)) continue;

      const entryPath = join(dirPath, entry);
      const stats = await fs.stat(entryPath);

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.rm(entryPath, { recursive: true, force: true });
      }
    }
  } catch (error) {
  }
}

export async function cleanupExpiredAll() {
  if (isCleaning) {
    return;
  }
  isCleaning = true;
  for (const target of cleanupTargets) {
    await cleanupDirectory(target.path, target.maxAge);
  }

  isCleaning = false;
}

export function scheduleCleanup(interval = 3 * 60 * 1000) {
  setInterval(cleanupExpiredAll, interval);
}

export async function initCleanup() {
  for (const target of cleanupTargets) {
    await ensureDir(target.path);
  }
  await cleanupExpiredAll();
  scheduleCleanup();
}
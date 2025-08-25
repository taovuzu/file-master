import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cleanupTargets = [
{ path: join(__dirname, '..', '..', 'temp', 'uploads'), maxAge: 1 * 60 * 1000 },
{ path: join(__dirname, '..', '..', 'temp'), maxAge: 1 * 60 * 1000 },
{ path: join(__dirname, '..', '..', 'public', 'processed'), maxAge: 5 * 60 * 1000 }];


const excludedDirs = ['important-job', 'do-not-delete', 'uploads'];
let isCleaning = false;

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
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
        console.log(`Cleaned up expired: ${entryPath}`);
      }
    }
  } catch (error) {
    console.error(` Error cleaning directory ${dirPath}:`, error);
  }
}

export async function cleanupExpiredAll() {
  if (isCleaning) {
    console.log('Cleanup skipped (previous run still in progress)');
    return;
  }

  isCleaning = true;
  console.log('Running scheduled cleanup...');

  for (const target of cleanupTargets) {
    await cleanupDirectory(target.path, target.maxAge);
  }

  isCleaning = false;
  console.log('Cleanup cycle completed');
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
  console.log('Multi-directory cleanup system initialized');
}
import cluster from 'cluster';
import os from 'os';

export class ClusterManager {
  constructor(options = {}) {
    this.numWorkers = options.numWorkers || os.cpus().length;
    this.restartDelay = options.restartDelay || 1000;
    this.maxRestarts = options.maxRestarts || 10;
    this.restartCounts = new Map();
  }

  start() {
    if (cluster.isPrimary) {
      this.startMaster();
    } else {
      this.startWorker();
    }
  }

  startMaster() {
    console.log(`🚀 Master ${process.pid} running, forking ${this.numWorkers} workers`);

    for (let i = 0; i < this.numWorkers; i++) {
      this.forkWorker();
    }

    cluster.on('exit', (worker, code, signal) => {
      const restartCount = this.restartCounts.get(worker.process.pid) || 0;

      if (restartCount < this.maxRestarts) {
        console.warn(`⚠️ Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}), restarting (${restartCount + 1}/${this.maxRestarts})`);
        this.restartCounts.set(worker.process.pid, restartCount + 1);
        setTimeout(() => this.forkWorker(), this.restartDelay);
      } else {
        console.error(`❌ Worker ${worker.process.pid} exceeded max restart attempts`);
      }
    });

    this.setupGracefulShutdown();
  }

  forkWorker() {
    const worker = cluster.fork();
    this.restartCounts.set(worker.process.pid, 0);
    return worker;
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`🛑 ${signal} received, shutting down master...`);
      const workers = Object.values(cluster.workers);

      for (const worker of workers) {
        if (worker && !worker.isDead()) {
          worker.send('shutdown');
        }
      }

      const shutdownTimeout = setTimeout(() => process.exit(0), 10000);

      const checkWorkers = setInterval(() => {
        const aliveWorkers = Object.values(cluster.workers).filter(w => w && !w.isDead());
        if (aliveWorkers.length === 0) {
          clearInterval(checkWorkers);
          clearTimeout(shutdownTimeout);
          process.exit(0);
        }
      }, 500);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  startWorker() {
    process.on('message', (msg) => {
      if (msg === 'shutdown') this.gracefulShutdown();
    });

    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
  }

  gracefulShutdown() {
    setTimeout(() => process.exit(0), 2000);
  }

  static getClusterInfo() {
    if (cluster.isPrimary) {
      return {
        isMaster: true,
        workers: Object.keys(cluster.workers).length,
        cpus: os.cpus().length,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        }
      };
    } else {
      return {
        isMaster: false,
        workerId: cluster.worker.id,
        pid: process.pid
      };
    }
  }
}

export default ClusterManager;

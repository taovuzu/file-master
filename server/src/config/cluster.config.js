import os from 'os';

export const clusterConfig = {
  enabled: process.env.CLUSTER_ENABLED !== 'false',

  numWorkers: process.env.NUM_WORKERSF ? parseInt(process.env.NUM_WORKERS) : 6,
  restartDelay: parseInt(process.env.RESTART_DELAY) || 1000,
  maxRestarts: parseInt(process.env.MAX_RESTARTS) || 10,
  workerShutdownTimeout: parseInt(process.env.WORKER_SHUTDOWN_TIMEOUT) || 5000,
  masterShutdownTimeout: parseInt(process.env.MASTER_SHUTDOWN_TIMEOUT) || 10000,

  development: {
    numWorkers: process.env.DEV_NUM_WORKERS
      ? parseInt(process.env.DEV_NUM_WORKERS)
      : 4,
    restartDelay: 500,
    maxRestarts: 5
  },

  production: {
    numWorkers: process.env.PROD_NUM_WORKERS
      ? parseInt(process.env.PROD_NUM_WORKERS)
      : os.cpus().length,
    restartDelay: 1000,
    maxRestarts: 10
  }
};

export const getClusterConfig = () => {
  const env = (process.env.NODE_ENV || 'development');
  const baseConfig = { ...clusterConfig };

  let envConfig = {};
  if (env === 'development') {
    envConfig = baseConfig.development;
  } else if (env === 'production') {
    envConfig = baseConfig.production;
  }

  const finalConfig = { ...baseConfig, ...envConfig };
  return finalConfig;
};

export default clusterConfig;

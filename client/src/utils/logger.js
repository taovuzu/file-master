




const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};


const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' ?
LOG_LEVELS.ERROR :
LOG_LEVELS.DEBUG;




class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
  }








  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}]` : '';
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `${timestamp} ${level} ${prefix} ${message}${dataStr}`;
  }






  error(message, error = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      const logMessage = this.formatMessage('ERROR', message, error);
      console.error(logMessage);


      if (process.env.NODE_ENV === 'production') {
        this.sendToLoggingService('error', message, error);
      }
    }
  }






  warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      const logMessage = this.formatMessage('WARN', message, data);
      console.warn(logMessage);
    }
  }






  info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      const logMessage = this.formatMessage('INFO', message, data);
      console.info(logMessage);
    }
  }






  debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.debug(logMessage);
    }
  }






  trace(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.TRACE) {
      const logMessage = this.formatMessage('TRACE', message, data);
      console.trace(logMessage);
    }
  }







  apiRequest(method, url, data = null) {
    this.debug(`API Request: ${method} ${url}`, data);
  }








  apiResponse(method, url, status, data = null) {
    const level = status >= 400 ? 'error' : 'debug';
    this[level](`API Response: ${method} ${url} - ${status}`, data);
  }






  userAction(action, data = null) {
    this.info(`User Action: ${action}`, data);
  }







  performance(metric, value, unit = 'ms') {
    this.info(`Performance: ${metric} = ${value}${unit}`);
  }







  sendToLoggingService(level, message, data = null) {















  }






  createLogger(prefix) {
    return new Logger(prefix);
  }
}


const defaultLogger = new Logger();


export default defaultLogger;
export { Logger };


export const apiLogger = defaultLogger.createLogger('API');
export const authLogger = defaultLogger.createLogger('AUTH');
export const pdfLogger = defaultLogger.createLogger('PDF');
export const uiLogger = defaultLogger.createLogger('UI');
export const errorLogger = defaultLogger.createLogger('ERROR');


export const logError = (message, error) => {
  errorLogger.error(message, error);
};

export const logApiRequest = (method, url, data) => {
  apiLogger.apiRequest(method, url, data);
};

export const logApiResponse = (method, url, status, data) => {
  apiLogger.apiResponse(method, url, status, data);
};

export const logUserAction = (action, data) => {
  defaultLogger.userAction(action, data);
};

export const logPerformance = (metric, value, unit) => {
  defaultLogger.performance(metric, value, unit);
};
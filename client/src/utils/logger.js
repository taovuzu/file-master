/**
 * Logger utility for consistent logging across the application
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

// Current log level (can be set via environment variable)
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.ERROR 
  : LOG_LEVELS.DEBUG;

/**
 * Base logger class
 */
class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} data - Additional data
   * @returns {string} - Formatted log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}]` : '';
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `${timestamp} ${level} ${prefix} ${message}${dataStr}`;
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|any} error - Error object or additional data
   */
  error(message, error = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      const logMessage = this.formatMessage('ERROR', message, error);
      console.error(logMessage);
      
      // In production, you might want to send errors to a logging service
      if (process.env.NODE_ENV === 'production') {
        this.sendToLoggingService('error', message, error);
      }
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {any} data - Additional data
   */
  warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      const logMessage = this.formatMessage('WARN', message, data);
      console.warn(logMessage);
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {any} data - Additional data
   */
  info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      const logMessage = this.formatMessage('INFO', message, data);
      console.info(logMessage);
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {any} data - Additional data
   */
  debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.debug(logMessage);
    }
  }

  /**
   * Log trace message
   * @param {string} message - Trace message
   * @param {any} data - Additional data
   */
  trace(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.TRACE) {
      const logMessage = this.formatMessage('TRACE', message, data);
      console.trace(logMessage);
    }
  }

  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {any} data - Request data
   */
  apiRequest(method, url, data = null) {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  /**
   * Log API response
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status
   * @param {any} data - Response data
   */
  apiResponse(method, url, status, data = null) {
    const level = status >= 400 ? 'error' : 'debug';
    this[level](`API Response: ${method} ${url} - ${status}`, data);
  }

  /**
   * Log user action
   * @param {string} action - User action
   * @param {any} data - Action data
   */
  userAction(action, data = null) {
    this.info(`User Action: ${action}`, data);
  }

  /**
   * Log performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Metric unit
   */
  performance(metric, value, unit = 'ms') {
    this.info(`Performance: ${metric} = ${value}${unit}`);
  }

  /**
   * Send log to external logging service (placeholder)
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  sendToLoggingService(level, message, data = null) {
    // Implement integration with external logging services like:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // - Custom logging service
    
    // Example implementation:
    /*
    if (window.Sentry) {
      window.Sentry.captureMessage(message, {
        level: level,
        extra: data
      });
    }
    */
  }

  /**
   * Create a new logger instance with prefix
   * @param {string} prefix - Logger prefix
   * @returns {Logger} - New logger instance
   */
  createLogger(prefix) {
    return new Logger(prefix);
  }
}

// Create default logger instance
const defaultLogger = new Logger();

// Export default logger and Logger class
export default defaultLogger;
export { Logger };

// Create specialized loggers
export const apiLogger = defaultLogger.createLogger('API');
export const authLogger = defaultLogger.createLogger('AUTH');
export const pdfLogger = defaultLogger.createLogger('PDF');
export const uiLogger = defaultLogger.createLogger('UI');
export const errorLogger = defaultLogger.createLogger('ERROR');

// Utility functions for common logging patterns
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

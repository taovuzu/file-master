import React from 'react';
import analytics from './analytics';

/**
 * Performance monitoring utility for tracking and optimizing application performance
 * Includes metrics collection, performance budgets, and optimization suggestions
 */

// Performance metrics
const PERFORMANCE_METRICS = {
  // Core Web Vitals
  LCP: 'largest_contentful_paint',
  FID: 'first_input_delay',
  CLS: 'cumulative_layout_shift',
  FCP: 'first_contentful_paint',
  TTFB: 'time_to_first_byte',
  
  // Custom metrics
  PAGE_LOAD: 'page_load',
  COMPONENT_RENDER: 'component_render',
  API_REQUEST: 'api_request',
  PDF_PROCESSING: 'pdf_processing',
  FILE_UPLOAD: 'file_upload',
  ANIMATION_FRAME: 'animation_frame',
};

// Performance budgets (in milliseconds)
const PERFORMANCE_BUDGETS = {
  [PERFORMANCE_METRICS.LCP]: 2500,    // 2.5 seconds
  [PERFORMANCE_METRICS.FID]: 100,     // 100 milliseconds
  [PERFORMANCE_METRICS.CLS]: 0.1,     // 0.1
  [PERFORMANCE_METRICS.FCP]: 1800,    // 1.8 seconds
  [PERFORMANCE_METRICS.TTFB]: 600,    // 600 milliseconds
  [PERFORMANCE_METRICS.PAGE_LOAD]: 3000, // 3 seconds
  [PERFORMANCE_METRICS.COMPONENT_RENDER]: 100, // 100 milliseconds
  [PERFORMANCE_METRICS.API_REQUEST]: 2000, // 2 seconds
  [PERFORMANCE_METRICS.PDF_PROCESSING]: 10000, // 10 seconds
  [PERFORMANCE_METRICS.FILE_UPLOAD]: 5000, // 5 seconds
};

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.budgets = PERFORMANCE_BUDGETS;
    this.enabled = true;
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Initialize performance monitoring
   */
  initialize() {
    if (typeof window === 'undefined') return;

    this.setupCoreWebVitals();
    this.setupPerformanceObserver();
    this.setupResourceTiming();
    this.setupNavigationTiming();
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  setupCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric(PERFORMANCE_METRICS.LCP, lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric(PERFORMANCE_METRICS.FID, entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric(PERFORMANCE_METRICS.CLS, clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        this.recordMetric(PERFORMANCE_METRICS.FCP, firstEntry.startTime);
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    }
  }

  /**
   * Setup Performance Observer for custom metrics
   */
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric(entry.name, entry.duration);
        });
      });
      observer.observe({ entryTypes: ['measure'] });
    }
  }

  /**
   * Setup Resource Timing monitoring
   */
  setupResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            this.recordMetric(PERFORMANCE_METRICS.API_REQUEST, entry.duration, {
              url: entry.name,
              type: entry.initiatorType,
            });
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Setup Navigation Timing monitoring
   */
  setupNavigationTiming() {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordMetric(PERFORMANCE_METRICS.TTFB, navigation.responseStart - navigation.requestStart);
          this.recordMetric(PERFORMANCE_METRICS.PAGE_LOAD, navigation.loadEventEnd - navigation.loadEventStart);
        }
      });
    }
  }

  /**
   * Record a performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} context - Additional context
   */
  recordMetric(name, value, context = {}) {
    if (!this.enabled) return;

    const metric = {
      name,
      value,
      timestamp: Date.now(),
      context,
    };

    this.metrics.set(name, metric);

    // Check against budget
    const budget = this.budgets[name];
    if (budget && value > budget) {
      this.handleBudgetExceeded(name, value, budget);
    }

    // Send to analytics
    analytics.trackPerformance(name, value, context);

    // Log in debug mode
    if (this.debug) {
      console.log(`Performance Metric: ${name} = ${value}ms`, context);
    }
  }

  /**
   * Handle budget exceeded
   * @param {string} metric - Metric name
   * @param {number} value - Actual value
   * @param {number} budget - Budget value
   */
  handleBudgetExceeded(metric, value, budget) {
    const warning = {
      metric,
      value,
      budget,
      percentage: ((value - budget) / budget) * 100,
      timestamp: Date.now(),
    };

    console.warn('Performance Budget Exceeded:', warning);
    
    // Send to analytics
    analytics.track('performance_budget_exceeded', warning);
  }

  /**
   * Start a performance measurement
   * @param {string} name - Measurement name
   * @param {Object} context - Additional context
   * @returns {Function} Stop function
   */
  startMeasurement(name, context = {}) {
    const startTime = performance.now();
    
    return (additionalContext = {}) => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...context, ...additionalContext });
    };
  }

  /**
   * Measure a function execution time
   * @param {string} name - Measurement name
   * @param {Function} fn - Function to measure
   * @param {Object} context - Additional context
   * @returns {Promise} Function result
   */
  async measureFunction(name, fn, context = {}) {
    const stop = this.startMeasurement(name, context);
    
    try {
      const result = await fn();
      stop({ success: true });
      return result;
    } catch (error) {
      stop({ success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   * @returns {Map} Metrics map
   */
  getMetrics() {
    return new Map(this.metrics);
  }

  /**
   * Get metric by name
   * @param {string} name - Metric name
   * @returns {Object} Metric data
   */
  getMetric(name) {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
  }

  /**
   * Get performance report
   * @returns {Object} Performance report
   */
  getReport() {
    const report = {
      timestamp: Date.now(),
      metrics: {},
      budgets: {},
      recommendations: [],
    };

    // Add metrics
    this.metrics.forEach((metric, name) => {
      report.metrics[name] = metric;
    });

    // Add budget comparisons
    Object.entries(this.budgets).forEach(([metric, budget]) => {
      const actual = this.metrics.get(metric);
      if (actual) {
        report.budgets[metric] = {
          budget,
          actual: actual.value,
          percentage: (actual.value / budget) * 100,
          exceeded: actual.value > budget,
        };
      }
    });

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  /**
   * Generate performance recommendations
   * @param {Object} report - Performance report
   * @returns {Array} Recommendations
   */
  generateRecommendations(report) {
    const recommendations = [];

    // Check Core Web Vitals
    if (report.budgets[PERFORMANCE_METRICS.LCP]?.exceeded) {
      recommendations.push({
        type: 'critical',
        metric: PERFORMANCE_METRICS.LCP,
        message: 'Largest Contentful Paint is too slow. Consider optimizing images, reducing server response time, or implementing lazy loading.',
        impact: 'high',
      });
    }

    if (report.budgets[PERFORMANCE_METRICS.FID]?.exceeded) {
      recommendations.push({
        type: 'critical',
        metric: PERFORMANCE_METRICS.FID,
        message: 'First Input Delay is too high. Consider reducing JavaScript bundle size or implementing code splitting.',
        impact: 'high',
      });
    }

    if (report.budgets[PERFORMANCE_METRICS.CLS]?.exceeded) {
      recommendations.push({
        type: 'critical',
        metric: PERFORMANCE_METRICS.CLS,
        message: 'Cumulative Layout Shift is too high. Ensure images and ads have explicit dimensions.',
        impact: 'high',
      });
    }

    // Check API performance
    if (report.budgets[PERFORMANCE_METRICS.API_REQUEST]?.exceeded) {
      recommendations.push({
        type: 'warning',
        metric: PERFORMANCE_METRICS.API_REQUEST,
        message: 'API requests are taking too long. Consider implementing caching or optimizing backend performance.',
        impact: 'medium',
      });
    }

    return recommendations;
  }

  /**
   * Enable/disable performance monitoring
   * @param {boolean} enabled - Whether monitoring is enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Set debug mode
   * @param {boolean} debug - Whether debug mode is enabled
   */
  setDebug(debug) {
    this.debug = debug;
  }
}

// Create global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render time
 * @param {string} componentName - Component name
 * @returns {Object} Performance utilities
 */
const usePerformanceMeasurement = (componentName) => {
  const measureRender = React.useCallback((additionalContext = {}) => {
    performanceMonitor.recordMetric(PERFORMANCE_METRICS.COMPONENT_RENDER, 0, {
      component: componentName,
      ...additionalContext,
    });
  }, [componentName]);

  const measureAsync = React.useCallback(async (name, fn, context = {}) => {
    return performanceMonitor.measureFunction(name, fn, {
      component: componentName,
      ...context,
    });
  }, [componentName]);

  return { measureRender, measureAsync };
};

/**
 * Hook for measuring PDF processing performance
 * @returns {Object} PDF performance utilities
 */
const usePdfPerformance = () => {
  const measureUpload = React.useCallback((fileSize, additionalContext = {}) => {
    return performanceMonitor.startMeasurement(PERFORMANCE_METRICS.FILE_UPLOAD, {
      fileSize,
      type: 'upload',
      ...additionalContext,
    });
  }, []);

  const measureProcessing = React.useCallback((operation, additionalContext = {}) => {
    return performanceMonitor.startMeasurement(PERFORMANCE_METRICS.PDF_PROCESSING, {
      operation,
      type: 'processing',
      ...additionalContext,
    });
  }, []);

  return { measureUpload, measureProcessing };
};

/**
 * Performance optimization utilities
 */

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memoize function for expensive calculations
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
const memoize = (func) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Lazy load component for code splitting
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Loading options
 * @returns {React.Component} Lazy component
 */
const lazyLoad = (importFunc, options = {}) => {
  const { fallback = null, timeout = 5000 } = options;
  
  return React.lazy(() => {
    return Promise.race([
      importFunc(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Lazy load timeout')), timeout)
      ),
    ]);
  });
};

/**
 * Performance monitoring utilities
 */
const performanceUtils = {
  /**
   * Initialize performance monitoring
   */
  initialize: () => {
    performanceMonitor.initialize();
  },

  /**
   * Get performance report
   */
  getReport: () => {
    return performanceMonitor.getReport();
  },

  /**
   * Record custom metric
   */
  recordMetric: (name, value, context) => {
    performanceMonitor.recordMetric(name, value, context);
  },

  /**
   * Start measurement
   */
  startMeasurement: (name, context) => {
    return performanceMonitor.startMeasurement(name, context);
  },

  /**
   * Measure function
   */
  measureFunction: (name, fn, context) => {
    return performanceMonitor.measureFunction(name, fn, context);
  },
};

// Export performance monitor instance and utilities
export default performanceMonitor;
export {
  PERFORMANCE_METRICS,
  PERFORMANCE_BUDGETS,
  usePerformanceMeasurement,
  usePdfPerformance,
  debounce,
  throttle,
  memoize,
  lazyLoad,
  performanceUtils,
};

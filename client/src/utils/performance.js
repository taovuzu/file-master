import React from 'react';
import analytics from './analytics';







const PERFORMANCE_METRICS = {

  LCP: 'largest_contentful_paint',
  FID: 'first_input_delay',
  CLS: 'cumulative_layout_shift',
  FCP: 'first_contentful_paint',
  TTFB: 'time_to_first_byte',


  PAGE_LOAD: 'page_load',
  COMPONENT_RENDER: 'component_render',
  API_REQUEST: 'api_request',
  PDF_PROCESSING: 'pdf_processing',
  FILE_UPLOAD: 'file_upload',
  ANIMATION_FRAME: 'animation_frame'
};


const PERFORMANCE_BUDGETS = {
  [PERFORMANCE_METRICS.LCP]: 2500,
  [PERFORMANCE_METRICS.FID]: 100,
  [PERFORMANCE_METRICS.CLS]: 0.1,
  [PERFORMANCE_METRICS.FCP]: 1800,
  [PERFORMANCE_METRICS.TTFB]: 600,
  [PERFORMANCE_METRICS.PAGE_LOAD]: 3000,
  [PERFORMANCE_METRICS.COMPONENT_RENDER]: 100,
  [PERFORMANCE_METRICS.API_REQUEST]: 2000,
  [PERFORMANCE_METRICS.PDF_PROCESSING]: 10000,
  [PERFORMANCE_METRICS.FILE_UPLOAD]: 5000
};




class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.budgets = PERFORMANCE_BUDGETS;
    this.enabled = true;
    this.debug = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  }




  initialize() {
    if (typeof window === 'undefined') return;

    this.setupCoreWebVitals();
    this.setupPerformanceObserver();
    this.setupResourceTiming();
    this.setupNavigationTiming();
  }




  setupCoreWebVitals() {

    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric(PERFORMANCE_METRICS.LCP, lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });


      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric(PERFORMANCE_METRICS.FID, entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });


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


      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        this.recordMetric(PERFORMANCE_METRICS.FCP, firstEntry.startTime);
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    }
  }




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




  setupResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            this.recordMetric(PERFORMANCE_METRICS.API_REQUEST, entry.duration, {
              url: entry.name,
              type: entry.initiatorType
            });
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }




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







  recordMetric(name, value, context = {}) {
    if (!this.enabled) return;

    const metric = {
      name,
      value,
      timestamp: Date.now(),
      context
    };

    this.metrics.set(name, metric);


    const budget = this.budgets[name];
    if (budget && value > budget) {
      this.handleBudgetExceeded(name, value, budget);
    }


    analytics.trackPerformance(name, value, context);


    if (this.debug) {
      console.log(`Performance Metric: ${name} = ${value}ms`, context);
    }
  }







  handleBudgetExceeded(metric, value, budget) {
    const warning = {
      metric,
      value,
      budget,
      percentage: (value - budget) / budget * 100,
      timestamp: Date.now()
    };

    console.warn('Performance Budget Exceeded:', warning);


    analytics.track('performance_budget_exceeded', warning);
  }







  startMeasurement(name, context = {}) {
    const startTime = performance.now();

    return (additionalContext = {}) => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...context, ...additionalContext });
    };
  }








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





  getMetrics() {
    return new Map(this.metrics);
  }






  getMetric(name) {
    return this.metrics.get(name);
  }




  clearMetrics() {
    this.metrics.clear();
  }





  getReport() {
    const report = {
      timestamp: Date.now(),
      metrics: {},
      budgets: {},
      recommendations: []
    };


    this.metrics.forEach((metric, name) => {
      report.metrics[name] = metric;
    });


    Object.entries(this.budgets).forEach(([metric, budget]) => {
      const actual = this.metrics.get(metric);
      if (actual) {
        report.budgets[metric] = {
          budget,
          actual: actual.value,
          percentage: actual.value / budget * 100,
          exceeded: actual.value > budget
        };
      }
    });


    report.recommendations = this.generateRecommendations(report);

    return report;
  }






  generateRecommendations(report) {
    const recommendations = [];


    if (report.budgets[PERFORMANCE_METRICS.LCP]?.exceeded) {
      recommendations.push({
        type: 'critical',
        metric: PERFORMANCE_METRICS.LCP,
        message: 'Largest Contentful Paint is too slow. Consider optimizing images, reducing server response time, or implementing lazy loading.',
        impact: 'high'
      });
    }

    if (report.budgets[PERFORMANCE_METRICS.FID]?.exceeded) {
      recommendations.push({
        type: 'critical',
        metric: PERFORMANCE_METRICS.FID,
        message: 'First Input Delay is too high. Consider reducing JavaScript bundle size or implementing code splitting.',
        impact: 'high'
      });
    }

    if (report.budgets[PERFORMANCE_METRICS.CLS]?.exceeded) {
      recommendations.push({
        type: 'critical',
        metric: PERFORMANCE_METRICS.CLS,
        message: 'Cumulative Layout Shift is too high. Ensure images and ads have explicit dimensions.',
        impact: 'high'
      });
    }


    if (report.budgets[PERFORMANCE_METRICS.API_REQUEST]?.exceeded) {
      recommendations.push({
        type: 'warning',
        metric: PERFORMANCE_METRICS.API_REQUEST,
        message: 'API requests are taking too long. Consider implementing caching or optimizing backend performance.',
        impact: 'medium'
      });
    }

    return recommendations;
  }





  setEnabled(enabled) {
    this.enabled = enabled;
  }





  setDebug(debug) {
    this.debug = debug;
  }
}


const performanceMonitor = new PerformanceMonitor();






const usePerformanceMeasurement = (componentName) => {
  const measureRender = React.useCallback((additionalContext = {}) => {
    performanceMonitor.recordMetric(PERFORMANCE_METRICS.COMPONENT_RENDER, 0, {
      component: componentName,
      ...additionalContext
    });
  }, [componentName]);

  const measureAsync = React.useCallback(async (name, fn, context = {}) => {
    return performanceMonitor.measureFunction(name, fn, {
      component: componentName,
      ...context
    });
  }, [componentName]);

  return { measureRender, measureAsync };
};





const usePdfPerformance = () => {
  const measureUpload = React.useCallback((fileSize, additionalContext = {}) => {
    return performanceMonitor.startMeasurement(PERFORMANCE_METRICS.FILE_UPLOAD, {
      fileSize,
      type: 'upload',
      ...additionalContext
    });
  }, []);

  const measureProcessing = React.useCallback((operation, additionalContext = {}) => {
    return performanceMonitor.startMeasurement(PERFORMANCE_METRICS.PDF_PROCESSING, {
      operation,
      type: 'processing',
      ...additionalContext
    });
  }, []);

  return { measureUpload, measureProcessing };
};











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







const lazyLoad = (importFunc, options = {}) => {
  const { fallback = null, timeout = 5000 } = options;

  return React.lazy(() => {
    return Promise.race([
    importFunc(),
    new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Lazy load timeout')), timeout)
    )]
    );
  });
};




const performanceUtils = {



  initialize: () => {
    performanceMonitor.initialize();
  },




  getReport: () => {
    return performanceMonitor.getReport();
  },




  recordMetric: (name, value, context) => {
    performanceMonitor.recordMetric(name, value, context);
  },




  startMeasurement: (name, context) => {
    return performanceMonitor.startMeasurement(name, context);
  },




  measureFunction: (name, fn, context) => {
    return performanceMonitor.measureFunction(name, fn, context);
  }
};


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
  performanceUtils };
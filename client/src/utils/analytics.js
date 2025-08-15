import React from 'react';

/**
 * Analytics utility for tracking user interactions and performance metrics
 * Supports multiple analytics providers and custom event tracking
 */

// Analytics providers
const ANALYTICS_PROVIDERS = {
  GOOGLE_ANALYTICS: 'google-analytics',
  MIXPANEL: 'mixpanel',
  AMPLITUDE: 'amplitude',
  CUSTOM: 'custom',
};

// Event types
const EVENT_TYPES = {
  // User actions
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // PDF operations
  PDF_UPLOAD: 'pdf_upload',
  PDF_PROCESS: 'pdf_process',
  PDF_DOWNLOAD: 'pdf_download',
  PDF_DELETE: 'pdf_delete',
  
  // Tool usage
  TOOL_ACCESS: 'tool_access',
  TOOL_COMPLETE: 'tool_complete',
  TOOL_ERROR: 'tool_error',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  NAVIGATION: 'navigation',
  
  // Performance
  PERFORMANCE: 'performance',
  ERROR: 'error',
  
  // Feature usage
  FEATURE_USE: 'feature_use',
  FEATURE_DISCOVER: 'feature_discover',
};

/**
 * Analytics configuration
 */
class AnalyticsConfig {
  constructor() {
    this.providers = new Map();
    this.enabled = true;
    this.debug = process.env.NODE_ENV === 'development';
    this.userId = null;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add analytics provider
   * @param {string} name - Provider name
   * @param {Object} config - Provider configuration
   */
  addProvider(name, config) {
    this.providers.set(name, config);
  }

  /**
   * Remove analytics provider
   * @param {string} name - Provider name
   */
  removeProvider(name) {
    this.providers.delete(name);
  }

  /**
   * Set user ID for tracking
   * @param {string} userId - User ID
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Enable/disable analytics
   * @param {boolean} enabled - Whether analytics is enabled
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

// Global analytics configuration
const analyticsConfig = new AnalyticsConfig();

/**
 * Base analytics provider class
 */
class BaseAnalyticsProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.initialized = false;
  }

  /**
   * Initialize the provider
   */
  async initialize() {
    this.initialized = true;
  }

  /**
   * Track an event
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   */
  async track(eventName, properties = {}) {
    if (!this.initialized) {
      console.warn(`Analytics provider ${this.name} not initialized`);
      return;
    }
  }

  /**
   * Set user properties
   * @param {Object} properties - User properties
   */
  async setUserProperties(properties = {}) {
    if (!this.initialized) {
      console.warn(`Analytics provider ${this.name} not initialized`);
      return;
    }
  }

  /**
   * Set user ID
   * @param {string} userId - User ID
   */
  async setUserId(userId) {
    if (!this.initialized) {
      console.warn(`Analytics provider ${this.name} not initialized`);
      return;
    }
  }
}

/**
 * Google Analytics provider
 */
class GoogleAnalyticsProvider extends BaseAnalyticsProvider {
  constructor(config = {}) {
    super('google-analytics', config);
    this.measurementId = config.measurementId;
  }

  async initialize() {
    if (typeof window !== 'undefined' && window.gtag) {
      this.initialized = true;
      return;
    }

    // Load Google Analytics script
    if (typeof window !== 'undefined' && this.measurementId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.measurementId);

      this.initialized = true;
    }
  }

  async track(eventName, properties = {}) {
    await super.track(eventName, properties);
    
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: properties.category || 'general',
        event_label: properties.label,
        value: properties.value,
        ...properties,
      });
    }
  }

  async setUserId(userId) {
    await super.setUserId(userId);
    
    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        user_id: userId,
      });
    }
  }
}

/**
 * Custom analytics provider for internal tracking
 */
class CustomAnalyticsProvider extends BaseAnalyticsProvider {
  constructor(config = {}) {
    super('custom', config);
    this.endpoint = config.endpoint || '/api/analytics';
    this.events = [];
  }

  async track(eventName, properties = {}) {
    await super.track(eventName, properties);
    
    const event = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: analyticsConfig.sessionId,
      userId: analyticsConfig.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.events.push(event);

    // Send to server if endpoint is configured
    if (this.endpoint && this.endpoint !== '/api/analytics') {
      try {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      } catch (error) {
        console.error('Failed to send analytics event:', error);
      }
    }

    // Log in debug mode
    if (analyticsConfig.debug) {
      console.log('Analytics Event:', event);
    }
  }

  /**
   * Get all tracked events
   * @returns {Array} Array of events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Clear events
   */
  clearEvents() {
    this.events = [];
  }
}

/**
 * Main analytics class
 */
class Analytics {
  constructor() {
    this.providers = new Map();
    this.config = analyticsConfig;
  }

  /**
   * Initialize analytics with providers
   * @param {Array} providers - Array of provider configurations
   */
  async initialize(providers = []) {
    for (const providerConfig of providers) {
      const { name, config } = providerConfig;
      
      let provider;
      switch (name) {
        case ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS:
          provider = new GoogleAnalyticsProvider(config);
          break;
        case ANALYTICS_PROVIDERS.CUSTOM:
          provider = new CustomAnalyticsProvider(config);
          break;
        default:
          console.warn(`Unknown analytics provider: ${name}`);
          continue;
      }

      this.providers.set(name, provider);
      await provider.initialize();
    }
  }

  /**
   * Track an event across all providers
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   */
  async track(eventName, properties = {}) {
    if (!this.config.enabled) return;

    const enhancedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      sessionId: this.config.sessionId,
      userId: this.config.userId,
    };

    const promises = Array.from(this.providers.values()).map(provider =>
      provider.track(eventName, enhancedProperties)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Track page view
   * @param {string} page - Page name
   * @param {Object} properties - Additional properties
   */
  async trackPageView(page, properties = {}) {
    await this.track(EVENT_TYPES.PAGE_VIEW, {
      page,
      category: 'navigation',
      ...properties,
    });
  }

  /**
   * Track user action
   * @param {string} action - Action name
   * @param {Object} properties - Action properties
   */
  async trackUserAction(action, properties = {}) {
    await this.track(action, {
      category: 'user_action',
      ...properties,
    });
  }

  /**
   * Track PDF operation
   * @param {string} operation - Operation name
   * @param {Object} properties - Operation properties
   */
  async trackPdfOperation(operation, properties = {}) {
    await this.track(operation, {
      category: 'pdf_operation',
      ...properties,
    });
  }

  /**
   * Track tool usage
   * @param {string} tool - Tool name
   * @param {string} action - Action performed
   * @param {Object} properties - Additional properties
   */
  async trackToolUsage(tool, action, properties = {}) {
    await this.track(EVENT_TYPES.TOOL_ACCESS, {
      tool,
      action,
      category: 'tool_usage',
      ...properties,
    });
  }

  /**
   * Track performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Metric unit
   */
  async trackPerformance(metric, value, unit = 'ms') {
    await this.track(EVENT_TYPES.PERFORMANCE, {
      metric,
      value,
      unit,
      category: 'performance',
    });
  }

  /**
   * Track error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  async trackError(error, context = {}) {
    await this.track(EVENT_TYPES.ERROR, {
      error: error.message,
      stack: error.stack,
      category: 'error',
      ...context,
    });
  }

  /**
   * Set user properties across all providers
   * @param {Object} properties - User properties
   */
  async setUserProperties(properties = {}) {
    const promises = Array.from(this.providers.values()).map(provider =>
      provider.setUserProperties(properties)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Set user ID across all providers
   * @param {string} userId - User ID
   */
  async setUserId(userId) {
    this.config.setUserId(userId);

    const promises = Array.from(this.providers.values()).map(provider =>
      provider.setUserId(userId)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get provider by name
   * @param {string} name - Provider name
   * @returns {BaseAnalyticsProvider} Provider instance
   */
  getProvider(name) {
    return this.providers.get(name);
  }

  /**
   * Enable/disable analytics
   * @param {boolean} enabled - Whether analytics is enabled
   */
  setEnabled(enabled) {
    this.config.setEnabled(enabled);
  }
}

// Create global analytics instance
const analytics = new Analytics();

/**
 * Analytics hooks and utilities
 */

/**
 * Hook for tracking page views
 * @param {string} page - Page name
 * @param {Object} properties - Additional properties
 */
const usePageTracking = (page, properties = {}) => {
  React.useEffect(() => {
    analytics.trackPageView(page, properties);
  }, [page, JSON.stringify(properties)]);
};

/**
 * Hook for tracking component interactions
 * @param {string} component - Component name
 * @returns {Object} Tracking functions
 */
const useComponentTracking = (component) => {
  const trackInteraction = React.useCallback((action, properties = {}) => {
    analytics.track('component_interaction', {
      component,
      action,
      ...properties,
    });
  }, [component]);

  const trackError = React.useCallback((error, context = {}) => {
    analytics.trackError(error, {
      component,
      ...context,
    });
  }, [component]);

  return { trackInteraction, trackError };
};

/**
 * Performance tracking utilities
 */
const performanceTracking = {
  /**
   * Track page load time
   */
  trackPageLoad: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        analytics.trackPerformance('page_load', loadTime);
      });
    }
  },

  /**
   * Track API request time
   * @param {string} endpoint - API endpoint
   * @param {number} startTime - Start time
   */
  trackApiRequest: (endpoint, startTime) => {
    const duration = performance.now() - startTime;
    analytics.trackPerformance('api_request', duration, {
      endpoint,
    });
  },

  /**
   * Track PDF processing time
   * @param {string} operation - PDF operation
   * @param {number} startTime - Start time
   */
  trackPdfProcessing: (operation, startTime) => {
    const duration = performance.now() - startTime;
    analytics.trackPerformance('pdf_processing', duration, {
      operation,
    });
  },
};

// Export analytics instance and utilities
export default analytics;
export { 
  ANALYTICS_PROVIDERS, 
  EVENT_TYPES, 
  BaseAnalyticsProvider,
  GoogleAnalyticsProvider,
  CustomAnalyticsProvider,
  performanceTracking,
  usePageTracking,
  useComponentTracking,
};

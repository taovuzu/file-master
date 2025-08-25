import React from 'react';







const ANALYTICS_PROVIDERS = {
  GOOGLE_ANALYTICS: 'google-analytics',
  MIXPANEL: 'mixpanel',
  AMPLITUDE: 'amplitude',
  CUSTOM: 'custom'
};


const EVENT_TYPES = {

  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',


  PDF_UPLOAD: 'pdf_upload',
  PDF_PROCESS: 'pdf_process',
  PDF_DOWNLOAD: 'pdf_download',
  PDF_DELETE: 'pdf_delete',


  TOOL_ACCESS: 'tool_access',
  TOOL_COMPLETE: 'tool_complete',
  TOOL_ERROR: 'tool_error',


  PAGE_VIEW: 'page_view',
  NAVIGATION: 'navigation',


  PERFORMANCE: 'performance',
  ERROR: 'error',


  FEATURE_USE: 'feature_use',
  FEATURE_DISCOVER: 'feature_discover'
};




class AnalyticsConfig {
  constructor() {
    this.providers = new Map();
    this.enabled = true;
    this.debug = process.env.NODE_ENV === 'development';
    this.userId = null;
    this.sessionId = this.generateSessionId();
  }





  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }






  addProvider(name, config) {
    this.providers.set(name, config);
  }





  removeProvider(name) {
    this.providers.delete(name);
  }





  setUserId(userId) {
    this.userId = userId;
  }





  setEnabled(enabled) {
    this.enabled = enabled;
  }





  setDebug(debug) {
    this.debug = debug;
  }
}


const analyticsConfig = new AnalyticsConfig();




class BaseAnalyticsProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.initialized = false;
  }




  async initialize() {
    this.initialized = true;
  }






  async track(eventName, properties = {}) {
    if (!this.initialized) {
      console.warn(`Analytics provider ${this.name} not initialized`);
      return;
    }
  }





  async setUserProperties(properties = {}) {
    if (!this.initialized) {
      console.warn(`Analytics provider ${this.name} not initialized`);
      return;
    }
  }





  async setUserId(userId) {
    if (!this.initialized) {
      console.warn(`Analytics provider ${this.name} not initialized`);
      return;
    }
  }
}




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


    if (typeof window !== 'undefined' && this.measurementId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
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
        ...properties
      });
    }
  }

  async setUserId(userId) {
    await super.setUserId(userId);

    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        user_id: userId
      });
    }
  }
}




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
      url: window.location.href
    };

    this.events.push(event);


    if (this.endpoint && this.endpoint !== '/api/analytics') {
      try {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });
      } catch (error) {
        console.error('Failed to send analytics event:', error);
      }
    }


    if (analyticsConfig.debug) {
      console.log('Analytics Event:', event);
    }
  }





  getEvents() {
    return this.events;
  }




  clearEvents() {
    this.events = [];
  }
}




class Analytics {
  constructor() {
    this.providers = new Map();
    this.config = analyticsConfig;
  }





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






  async track(eventName, properties = {}) {
    if (!this.config.enabled) return;

    const enhancedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      sessionId: this.config.sessionId,
      userId: this.config.userId
    };

    const promises = Array.from(this.providers.values()).map((provider) =>
    provider.track(eventName, enhancedProperties)
    );

    await Promise.allSettled(promises);
  }






  async trackPageView(page, properties = {}) {
    await this.track(EVENT_TYPES.PAGE_VIEW, {
      page,
      category: 'navigation',
      ...properties
    });
  }






  async trackUserAction(action, properties = {}) {
    await this.track(action, {
      category: 'user_action',
      ...properties
    });
  }






  async trackPdfOperation(operation, properties = {}) {
    await this.track(operation, {
      category: 'pdf_operation',
      ...properties
    });
  }







  async trackToolUsage(tool, action, properties = {}) {
    await this.track(EVENT_TYPES.TOOL_ACCESS, {
      tool,
      action,
      category: 'tool_usage',
      ...properties
    });
  }







  async trackPerformance(metric, value, unit = 'ms') {
    await this.track(EVENT_TYPES.PERFORMANCE, {
      metric,
      value,
      unit,
      category: 'performance'
    });
  }






  async trackError(error, context = {}) {
    await this.track(EVENT_TYPES.ERROR, {
      error: error.message,
      stack: error.stack,
      category: 'error',
      ...context
    });
  }





  async setUserProperties(properties = {}) {
    const promises = Array.from(this.providers.values()).map((provider) =>
    provider.setUserProperties(properties)
    );

    await Promise.allSettled(promises);
  }





  async setUserId(userId) {
    this.config.setUserId(userId);

    const promises = Array.from(this.providers.values()).map((provider) =>
    provider.setUserId(userId)
    );

    await Promise.allSettled(promises);
  }






  getProvider(name) {
    return this.providers.get(name);
  }





  setEnabled(enabled) {
    this.config.setEnabled(enabled);
  }
}


const analytics = new Analytics();










const usePageTracking = (page, properties = {}) => {
  React.useEffect(() => {
    analytics.trackPageView(page, properties);
  }, [page, JSON.stringify(properties)]);
};






const useComponentTracking = (component) => {
  const trackInteraction = React.useCallback((action, properties = {}) => {
    analytics.track('component_interaction', {
      component,
      action,
      ...properties
    });
  }, [component]);

  const trackError = React.useCallback((error, context = {}) => {
    analytics.trackError(error, {
      component,
      ...context
    });
  }, [component]);

  return { trackInteraction, trackError };
};




const performanceTracking = {



  trackPageLoad: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        analytics.trackPerformance('page_load', loadTime);
      });
    }
  },






  trackApiRequest: (endpoint, startTime) => {
    const duration = performance.now() - startTime;
    analytics.trackPerformance('api_request', duration, {
      endpoint
    });
  },






  trackPdfProcessing: (operation, startTime) => {
    const duration = performance.now() - startTime;
    analytics.trackPerformance('pdf_processing', duration, {
      operation
    });
  }
};


export default analytics;
export {
  ANALYTICS_PROVIDERS,
  EVENT_TYPES,
  BaseAnalyticsProvider,
  GoogleAnalyticsProvider,
  CustomAnalyticsProvider,
  performanceTracking,
  usePageTracking,
  useComponentTracking };
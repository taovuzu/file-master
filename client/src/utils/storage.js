import { STORAGE_KEYS } from './constants';

/**
 * Storage utility for managing localStorage and sessionStorage
 */
class StorageManager {
  constructor(storageType = 'localStorage') {
    this.storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl = null) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl ? ttl * 1000 : null, // Convert to milliseconds
      };
      
      this.storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting storage item:', error);
    }
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if item not found or expired
   * @returns {any} - Stored value or default value
   */
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      
      if (!item) {
        return defaultValue;
      }

      const parsedItem = JSON.parse(item);
      
      // Check if item has expired
      if (parsedItem.ttl && Date.now() - parsedItem.timestamp > parsedItem.ttl) {
        this.remove(key);
        return defaultValue;
      }

      return parsedItem.value;
    } catch (error) {
      console.error('Error getting storage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Error removing storage item:', error);
    }
  }

  /**
   * Clear all items from storage
   */
  clear() {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Check if key exists in storage
   * @param {string} key - Storage key
   * @returns {boolean} - True if key exists
   */
  has(key) {
    try {
      return this.storage.getItem(key) !== null;
    } catch (error) {
      console.error('Error checking storage key:', error);
      return false;
    }
  }

  /**
   * Get all keys from storage
   * @returns {string[]} - Array of storage keys
   */
  keys() {
    try {
      return Object.keys(this.storage);
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  /**
   * Get storage size
   * @returns {number} - Number of items in storage
   */
  size() {
    try {
      return this.storage.length;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }

  /**
   * Get storage usage in bytes
   * @returns {number} - Storage usage in bytes
   */
  getUsage() {
    try {
      let total = 0;
      for (let key in this.storage) {
        if (this.storage.hasOwnProperty(key)) {
          total += this.storage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  }

  /**
   * Clean expired items from storage
   */
  cleanExpired() {
    try {
      const keys = this.keys();
      keys.forEach(key => {
        this.get(key); // This will automatically remove expired items
      });
    } catch (error) {
      console.error('Error cleaning expired storage items:', error);
    }
  }
}

// Create storage instances
export const localStorage = new StorageManager('localStorage');
export const sessionStorage = new StorageManager('sessionStorage');

// Auth storage utilities
export const authStorage = {
  setToken: (token) => localStorage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: () => localStorage.get(STORAGE_KEYS.AUTH_TOKEN),
  removeToken: () => localStorage.remove(STORAGE_KEYS.AUTH_TOKEN),
  
  setUser: (user) => localStorage.set(STORAGE_KEYS.USER_DATA, user),
  getUser: () => localStorage.get(STORAGE_KEYS.USER_DATA),
  removeUser: () => localStorage.remove(STORAGE_KEYS.USER_DATA),
  
  clear: () => {
    localStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.remove(STORAGE_KEYS.USER_DATA);
  }
};

// Settings storage utilities
export const settingsStorage = {
  setSettings: (settings) => localStorage.set(STORAGE_KEYS.SETTINGS, settings),
  getSettings: () => localStorage.get(STORAGE_KEYS.SETTINGS, {}),
  updateSettings: (updates) => {
    const current = settingsStorage.getSettings();
    const updated = { ...current, ...updates };
    settingsStorage.setSettings(updated);
    return updated;
  },
  removeSettings: () => localStorage.remove(STORAGE_KEYS.SETTINGS)
};

// Theme storage utilities
export const themeStorage = {
  setTheme: (theme) => localStorage.set(STORAGE_KEYS.THEME, theme),
  getTheme: () => localStorage.get(STORAGE_KEYS.THEME, 'light'),
  removeTheme: () => localStorage.remove(STORAGE_KEYS.THEME)
};

// Language storage utilities
export const languageStorage = {
  setLanguage: (language) => localStorage.set(STORAGE_KEYS.LANGUAGE, language),
  getLanguage: () => localStorage.get(STORAGE_KEYS.LANGUAGE, 'en'),
  removeLanguage: () => localStorage.remove(STORAGE_KEYS.LANGUAGE)
};

// PDF processing history storage
export const historyStorage = {
  setHistory: (history) => localStorage.set('pdf_history', history),
  getHistory: () => localStorage.get('pdf_history', []),
  addToHistory: (item) => {
    const history = historyStorage.getHistory();
    const updatedHistory = [item, ...history.slice(0, 9)]; // Keep last 10 items
    historyStorage.setHistory(updatedHistory);
    return updatedHistory;
  },
  clearHistory: () => localStorage.remove('pdf_history')
};

// File upload cache storage
export const uploadCacheStorage = {
  setCache: (key, data) => sessionStorage.set(`upload_cache_${key}`, data, 3600), // 1 hour TTL
  getCache: (key) => sessionStorage.get(`upload_cache_${key}`),
  removeCache: (key) => sessionStorage.remove(`upload_cache_${key}`),
  clearCache: () => {
    const keys = sessionStorage.keys();
    keys.forEach(key => {
      if (key.startsWith('upload_cache_')) {
        sessionStorage.remove(key);
      }
    });
  }
};

// Export default storage manager
export default localStorage;

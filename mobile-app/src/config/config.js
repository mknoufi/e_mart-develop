// E Mart Mobile App Configuration

// API Configuration
if (!process.env.API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is required but not set. Please ensure it is defined in your environment configuration. Refer to the deployment guide or README for more details.");
}
export const API_BASE_URL = process.env.API_BASE_URL;

// App Configuration
export const APP_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  offlineSyncInterval: 300000, // 5 minutes
  maxRetries: 3,
  cacheExpiry: 3600000, // 1 hour
};

// Feature Flags
export const FEATURES = {
  biometricAuth: true,
  offlineMode: true,
  pushNotifications: true,
  qrScanning: true,
  cameraIntegration: true,
  darkMode: true,
};

// App Constants
export const CONSTANTS = {
  APP_NAME: 'E Mart',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  SUPPORT_EMAIL: 'support@emart.com',
  PRIVACY_POLICY_URL: 'https://emart.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://emart.com/terms',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  APP_SETTINGS: 'appSettings',
  OFFLINE_DATA: 'offlineData',
  CACHE_DATA: 'cacheData',
  THEME_MODE: 'themeMode',
  LANGUAGE: 'language',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/method/login',
  LOGOUT: '/api/method/logout',
  
  // Dashboard
  DASHBOARD_DATA: '/api/method/e_mart.api.get_dashboard_data',
  
  // Series Management
  SERIES_DATA: '/api/method/e_mart.api.get_series_data',
  GENERATE_SERIES: '/api/method/e_mart.api.generate_series',
  RESET_SERIES: '/api/method/e_mart.api.reset_series',
  
  // Purchase Management
  PURCHASE_INVOICES: '/api/method/e_mart.api.get_purchase_invoices',
  CREATE_PURCHASE_INVOICE: '/api/method/e_mart.api.create_purchase_invoice',
  
  // Sales Management
  SALES_INVOICES: '/api/method/e_mart.api.get_sales_invoices',
  CREATE_SALES_INVOICE: '/api/method/e_mart.api.create_sales_invoice',
  
  // Inventory Management
  INVENTORY_ITEMS: '/api/method/e_mart.api.get_inventory_items',
  UPDATE_INVENTORY_ITEM: '/api/method/e_mart.api.update_inventory_item',
  
  // Special Schemes
  SPECIAL_SCHEMES: '/api/method/e_mart.api.get_special_schemes',
  CREATE_SPECIAL_SCHEME: '/api/method/e_mart.api.create_special_scheme',
  
  // Reports
  REPORTS: '/api/method/e_mart.api.get_report',
  
  // Notifications
  NOTIFICATIONS: '/api/method/e_mart.api.get_notifications',
  MARK_NOTIFICATION_READ: '/api/method/e_mart.api.mark_notification_read',
  
  // QR Code
  SCAN_QR: '/api/method/e_mart.api.scan_qr_code',
  
  // Settings
  APP_SETTINGS: '/api/method/e_mart.api.get_app_settings',
  UPDATE_APP_SETTINGS: '/api/method/e_mart.api.update_app_settings',
  
  // Offline Sync
  SYNC_OFFLINE_DATA: '/api/method/e_mart.api.sync_offline_data',
  
  // Health Check
  HEALTH_CHECK: '/api/method/ping',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  DATA_SAVED: 'Data saved successfully!',
  DATA_DELETED: 'Data deleted successfully!',
  SERIES_GENERATED: 'Series generated successfully!',
  SERIES_RESET: 'Series reset successfully!',
  INVOICE_CREATED: 'Invoice created successfully!',
  SYNC_COMPLETED: 'Data synchronized successfully!',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
};

// Currency Configuration
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  DECIMAL_PLACES: 2,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  LOAD_MORE_THRESHOLD: 5,
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
};

// Cache Configuration
export const CACHE_CONFIG = {
  DASHBOARD_DATA: 5 * 60 * 1000, // 5 minutes
  SERIES_DATA: 1 * 60 * 1000, // 1 minute
  INVENTORY_DATA: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 24 * 60 * 60 * 1000, // 24 hours
};

// Network Configuration
export const NETWORK_CONFIG = {
  TIMEOUT: 30000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
  OFFLINE_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

// Security Configuration
export const SECURITY_CONFIG = {
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

// Development Configuration
export const DEV_CONFIG = {
  DEBUG_MODE: __DEV__,
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',
  MOCK_API: false,
  ENABLE_ANALYTICS: !__DEV__,
  ENABLE_CRASH_REPORTING: !__DEV__,
};

export default {
  API_BASE_URL,
  APP_CONFIG,
  FEATURES,
  CONSTANTS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  DATE_FORMATS,
  CURRENCY,
  PAGINATION,
  ANIMATION_DURATIONS,
  CACHE_CONFIG,
  NETWORK_CONFIG,
  SECURITY_CONFIG,
  DEV_CONFIG,
}; 
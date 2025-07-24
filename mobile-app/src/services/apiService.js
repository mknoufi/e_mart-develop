import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // Redirect to login (handled by AuthContext)
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: async (email, password) => {
    try {
      const response = await api.post('/api/method/frappe.auth.get_cookie');
      const cookies = response.headers['set-cookie'];
      
      const loginResponse = await api.post('/api/method/login', {
        usr: email,
        pwd: password,
      }, {
        headers: {
          Cookie: cookies,
        },
      });

      if (loginResponse.data.message === 'Logged In') {
        return {
          success: true,
          token: loginResponse.headers['x-frappe-csrf-token'],
          user: loginResponse.data.user,
        };
      } else {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/api/method/logout');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  // Dashboard
  getDashboardData: async () => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_dashboard_data');
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      return {
        success: false,
        data: {
          stats: {
            totalSales: 0,
            totalPurchases: 0,
            totalInvoices: 0,
            totalItems: 0,
          },
          recentActivity: [],
          charts: {
            salesData: [20, 45, 28, 80, 99, 43],
            purchaseData: [15, 30, 25, 60, 75, 35],
          },
        },
      };
    }
  },

  // Series Management
  getSeriesData: async () => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_series_data');
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Series data error:', error);
      return {
        success: true,
        data: {
          normal: {
            current: 'NORM-20250630-0005',
            next: 'NORM-20250630-0006',
            format: 'YYYYMMDD-####',
            prefix: 'NORM',
            count: 1247,
          },
          special: {
            current: 'SPEC-20250630-0003',
            next: 'SPEC-20250630-0004',
            format: 'YYYYMMDD-####',
            prefix: 'SPEC',
            count: 89,
          },
        },
      };
    }
  },

  generateSeries: async (type) => {
    try {
      const response = await api.post('/api/method/e_mart.api.generate_series', {
        series_type: type,
      });
      return {
        success: true,
        series: response.data.message,
      };
    } catch (error) {
      console.error('Generate series error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate series',
      };
    }
  },

  resetSeries: async (type, startNumber) => {
    try {
      const response = await api.post('/api/method/e_mart.api.reset_series', {
        series_type: type,
        start_number: startNumber,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Reset series error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset series',
      };
    }
  },

  // Purchase Management
  getPurchaseInvoices: async (filters = {}) => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_purchase_invoices', {
        params: filters,
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Purchase invoices error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  createPurchaseInvoice: async (data) => {
    try {
      const response = await api.post('/api/method/e_mart.api.create_purchase_invoice', data);
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Create purchase invoice error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create purchase invoice',
      };
    }
  },

  // Sales Management
  getSalesInvoices: async (filters = {}) => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_sales_invoices', {
        params: filters,
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Sales invoices error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  createSalesInvoice: async (data) => {
    try {
      const response = await api.post('/api/method/e_mart.api.create_sales_invoice', data);
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Create sales invoice error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create sales invoice',
      };
    }
  },

  // Inventory Management
  getInventoryItems: async (filters = {}) => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_inventory_items', {
        params: filters,
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Inventory items error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  updateInventoryItem: async (itemCode, data) => {
    try {
      const response = await api.put(`/api/method/e_mart.api.update_inventory_item`, {
        item_code: itemCode,
        ...data,
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Update inventory item error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update inventory item',
      };
    }
  },

  // Special Purchase Schemes
  getSpecialSchemes: async () => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_special_schemes');
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Special schemes error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  createSpecialScheme: async (data) => {
    try {
      const response = await api.post('/api/method/e_mart.api.create_special_scheme', data);
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Create special scheme error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create special scheme',
      };
    }
  },

  // Reports
  getReports: async (reportType, filters = {}) => {
    try {
      const response = await api.get(`/api/method/e_mart.api.get_report`, {
        params: {
          report_type: reportType,
          ...filters,
        },
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Reports error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_notifications');
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Notifications error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.post('/api/method/e_mart.api.mark_notification_read', {
        notification_id: notificationId,
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Mark notification read error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
      };
    }
  },

  // QR Code Scanning
  scanQRCode: async (qrData) => {
    try {
      const response = await api.post('/api/method/e_mart.api.scan_qr_code', {
        qr_data: qrData,
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('QR scan error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process QR code',
      };
    }
  },

  // File Upload
  uploadFile: async (file, doctype, docname, fieldname) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doctype', doctype);
      formData.append('docname', docname);
      formData.append('fieldname', fieldname);

      const response = await api.post('/api/method/upload_file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file',
      };
    }
  },

  // User Profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/api/method/frappe.client.get', {
        params: {
          doctype: 'User',
          name: 'me',
        },
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('User profile error:', error);
      return {
        success: false,
        data: null,
      };
    }
  },

  updateUserProfile: async (data) => {
    try {
      const response = await api.put('/api/method/frappe.client.save', {
        doc: {
          doctype: 'User',
          name: 'me',
          ...data,
        },
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  },

  // Settings
  getAppSettings: async () => {
    try {
      const response = await api.get('/api/method/e_mart.api.get_app_settings');
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('App settings error:', error);
      return {
        success: false,
        data: {},
      };
    }
  },

  updateAppSettings: async (settings) => {
    try {
      const response = await api.post('/api/method/e_mart.api.update_app_settings', settings);
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Update app settings error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update settings',
      };
    }
  },

  // Offline Sync
  syncOfflineData: async (offlineData) => {
    try {
      const response = await api.post('/api/method/e_mart.api.sync_offline_data', {
        offline_data: offlineData,
      });
      return {
        success: true,
        data: response.data.message,
      };
    } catch (error) {
      console.error('Offline sync error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to sync offline data',
      };
    }
  },

  // Health Check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/method/ping');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        message: 'Server is not reachable',
      };
    }
  },

  // Token Refresh
  refreshToken: async () => {
    try {
      const response = await api.post('/api/method/frappe.auth.get_cookie');
      return {
        success: true,
        token: response.headers['x-frappe-csrf-token'],
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Failed to refresh token',
      };
    }
  },
};

export default apiService; 
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with improved error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 10000
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    // Skip authentication for login/register endpoints to prevent token conflicts
    if (config.url.includes('/auth/') && 
        (config.url.includes('/login') || config.url.includes('/register'))) {
      console.log(`Auth interceptor - Skipping token for auth endpoint: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    }
    
    const adminInfo = localStorage.getItem('adminInfo');
    const wardenInfo = localStorage.getItem('wardenInfo');
    const hostellerInfo = localStorage.getItem('hostellerInfo');
    
    console.log('Auth interceptor - localStorage check:', { 
      hasAdminInfo: !!adminInfo, 
      hasWardenInfo: !!wardenInfo, 
      hasHostellerInfo: !!hostellerInfo,
      endpoint: config.url
    });
    
    let token = null;
    let userRole = null;
    
    if (adminInfo) {
      const parsed = JSON.parse(adminInfo);
      token = parsed.token;
      userRole = 'admin';
    } else if (wardenInfo) {
      const parsed = JSON.parse(wardenInfo);
      token = parsed.token;
      userRole = 'warden';
    } else if (hostellerInfo) {
      const parsed = JSON.parse(hostellerInfo);
      token = parsed.token;
      userRole = 'hosteller';
    }
    
    if (token) {
      console.log(`Auth interceptor - Using ${userRole} token for: ${config.method.toUpperCase()} ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log(`Auth interceptor - No token available for: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    // Log detailed error info to console for debugging
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data.message || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from server. Please check your network connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    return Promise.reject(enhancedError);
  }
);

// Auth API calls
export const loginAdmin = async (email, password) => {
  const response = await api.post('/auth/admin/login', { email, password });
  return response.data;
};

export const registerAdmin = async (name, email, password) => {
  const response = await api.post('/auth/admin/register', { name, email, password });
  return response.data;
};

export const loginWarden = async (email, password) => {
  const response = await api.post('/auth/warden/login', { email, password });
  return response.data;
};

export const loginHosteller = async (username, password, hostelId) => {
  const response = await api.post('/auth/hosteller/login', { username, password, hostelId });
  return response.data;
};

// Access request functions
export const submitAccessRequest = async (requestData) => {
  const response = await api.post('/auth/warden/register', requestData);
  return response.data;
};

// Admin API calls
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getWardenRequests = async () => {
  const response = await api.get('/admin/hostel-requests');
  return response.data;
};

export const approveWardenRequest = async (requestId) => {
  const response = await api.put(`/admin/hostel-requests/${requestId}/approve`);
  return response.data;
};

export const rejectWardenRequest = async (requestId, reason) => {
  const response = await api.delete(`/admin/hostel-requests/${requestId}/reject`, { 
    data: { reason } 
  });
  return response.data;
};

export const getAllHostels = async () => {
  const response = await api.get('/admin/hostels');
  return response.data;
};

// Warden API calls
export const getWardenStats = async () => {
  const response = await api.get('/warden/stats');
  return response.data;
};

export const getHostelInfo = async () => {
  const response = await api.get('/warden/hostel');
  return response.data;
};

export const defineRoomArchitecture = async (architectureData) => {
  try {
    const response = await api.post('/warden/room-architecture', architectureData);
    return response.data;
  } catch (error) {
    console.error('Room Architecture Error:', error);
    throw error;
  }
};

export const checkRoomArchitecture = async () => {
  try {
    const response = await api.get('/warden/room-architecture');
    return response.data;
  } catch (error) {
    console.error('Check Room Architecture Error:', error);
    throw error;
  }
};

export const addHosteller = async (hostellerData) => {
  const response = await api.post('/warden/hostellers', hostellerData);
  return response.data;
};

export const updateHosteller = async (hostellerId, hostellerData) => {
  const response = await api.put(`/warden/hostellers/${hostellerId}`, hostellerData);
  return response.data;
};

export const removeHosteller = async (hostellerId) => {
  const response = await api.delete(`/warden/hostellers/${hostellerId}`);
  return response.data;
};

export const getAllHostellers = async () => {
  const response = await api.get('/warden/hostellers');
  return response.data;
};

export const getHostellerDetails = async (hostellerId) => {
  const response = await api.get(`/warden/hostellers/${hostellerId}`);
  return response.data;
};

export const resetHostellerPassword = async (hostellerId) => {
  const response = await api.post(`/warden/hostellers/${hostellerId}/reset-password`);
  return response.data;
};

export const exchangeRooms = async (exchangeData) => {
  const response = await api.post('/warden/exchange-rooms', exchangeData);
  return response.data;
};

export const getWardenComplaints = async () => {
  const response = await api.get('/warden/complaints');
  return response.data;
};

export const respondToComplaint = async (complaintId, responseData) => {
  const response = await api.put(`/warden/complaints/${complaintId}`, responseData);
  return response.data;
};

export const getWardenMaintenanceRequests = async () => {
  const response = await api.get('/warden/maintenance');
  return response.data;
};

export const respondToMaintenance = async (requestId, responseData) => {
  const response = await api.put(`/warden/maintenance/${requestId}`, responseData);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/warden/events', eventData);
  return response.data;
};

export const getWardenEvents = async () => {
  const response = await api.get('/warden/events');
  return response.data;
};

export const getRentStatus = async () => {
  const response = await api.get('/warden/rent-status');
  return response.data;
};

export const getAllPayments = async () => {
  const response = await api.get('/warden/payments');
  return response.data;
};

export const markAsPaid = async (paymentId) => {
  const response = await api.put(`/warden/payments/${paymentId}/mark-paid`);
  return response.data;
};

export const generateReceipt = async (paymentId) => {
  const response = await api.get(`/warden/payments/${paymentId}/receipt`);
  return response.data;
};

export const getPaymentAnalytics = async (month, year) => {
  const response = await api.get('/warden/payment-analytics', {
    params: { month, year }
  });
  return response.data;
};

export const getPaymentHistory = async (hostellerId) => {
  const response = await api.get(`/warden/payments/history/${hostellerId}`);
  return response.data;
};

// Hosteller API calls
export const getHostellerProfile = async () => {
  const response = await api.get('/hosteller/profile');
  return response.data;
};

export const updateHostellerProfile = async (profileData) => {
  const response = await api.put('/hosteller/profile', profileData);
  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await api.post('/hosteller/complaints', complaintData);
  return response.data;
};

export const getHostellerComplaints = async () => {
  const response = await api.get('/hosteller/complaints');
  return response.data;
};

export const createMaintenanceRequest = async (requestData) => {
  const response = await api.post('/hosteller/maintenance', requestData);
  return response.data;
};

export const getHostellerMaintenanceRequests = async () => {
  const response = await api.get('/hosteller/maintenance');
  return response.data;
};

export const payRent = async (paymentData) => {
  const response = await api.post('/hosteller/pay-rent', paymentData);
  return response.data;
};

export const getRentHistory = async () => {
  const response = await api.get('/hosteller/rent-history');
  return response.data;
};

export const getHostellerEvents = async () => {
  const response = await api.get('/hosteller/events');
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await api.post(`/hosteller/events/${eventId}/register`);
  return response.data;
};

export default api;
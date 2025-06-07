// src/api/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'https://sorathgaming.fun/api',
});

// Request Interceptor to Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Expiry Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem('authToken');
      window.location.href = '/login'; // Redirects to login
    }
    return Promise.reject(error);
  }
);

export default api;

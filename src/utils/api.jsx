import axios from 'axios';

const api = axios.create();

// 1. Intercept outgoing requests and attach the JWT wristband
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('coc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Intercept incoming responses and handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token is invalid or expired
      localStorage.removeItem('coc_token');
      // Force redirect to the login page
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;
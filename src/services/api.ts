import axios from 'axios';

// Base HTTP client pointing to the backend API domain
const api = axios.create({
  baseURL: 'https://schedulingapi-production-bd76.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically injects the JWT token into headers if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

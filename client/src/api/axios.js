import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn('VITE_API_URL is not defined. Falling back to current origin.');
    return '/api';
  }
  // Remove trailing slash if present to prevent double slashes with /api
  return `${url.replace(/\/$/, '')}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
});


// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      const authPaths = ['/login', '/register', '/provider/login', '/provider/register'];
      const isOnAuthPage = authPaths.some(p => window.location.pathname.startsWith(p));
      if (!isOnAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

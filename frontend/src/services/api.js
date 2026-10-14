import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // CRUCIAL: Enables sending and receiving HttpOnly cookies across origins
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Task 1: Register customer
 * POST /customers/register
 */
export const registerCustomer = async (data) => {
  const response = await API.post('/customers/register', data);
  return response.data;
};

/**
 * Task 2: Login customer
 * POST /customers/login
 */
export const loginCustomer = async (credentials) => {
  const response = await API.post('/customers/login', credentials);
  return response.data;
};

/**
 * Task 3: Fetch current customer profile (Protected)
 * GET /customers/me
 */
export const getProfile = async () => {
  const response = await API.get('/customers/me');
  return response.data;
};

/**
 * Task 4: Logout customer
 * POST /customers/logout
 */
export const logoutCustomer = async () => {
  const response = await API.post('/customers/logout');
  return response.data;
};

/**
 * Bonus: Change password
 * PATCH /customers/change-password
 */
export const changePassword = async (passwords) => {
  const response = await API.patch('/customers/change-password', passwords);
  return response.data;
};

export default API;

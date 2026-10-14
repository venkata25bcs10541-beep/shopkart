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

/**
 * Lab 03 Task 3, 5 & Bonus: Fetch all products with optional search, category, and sort
 * GET /products?search=...&category=...&sort=...
 */
export const getProducts = async (params = {}) => {
  const response = await API.get('/products', { params });
  return response.data;
};

/**
 * Lab 03 Task 4: Fetch single product by ID
 * GET /products/:id
 */
export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

/**
 * Lab 03 Task 2: Create a new product
 * POST /products
 */
export const createProduct = async (productData) => {
  const response = await API.post('/products', productData);
  return response.data;
};

/**
 * Lab 04 Task 2: Add product to current user's wishlist
 * POST /wishlist/:productId
 */
export const addToWishlist = async (productId) => {
  const response = await API.post(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Lab 04 Task 3: Get current user's wishlist
 * GET /wishlist
 */
export const getWishlist = async () => {
  const response = await API.get('/wishlist');
  return response.data;
};

/**
 * Lab 04 Task 4: Remove product from current user's wishlist
 * DELETE /wishlist/:productId
 */
export const removeFromWishlist = async (productId) => {
  const response = await API.delete(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Lab 04 Bonus 1: Toggle product in wishlist
 * PATCH /wishlist/:productId/toggle
 */
export const toggleWishlist = async (productId) => {
  const response = await API.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

/**
 * Lab 04 Bonus 2: Get wishlist count for navbar badge
 * GET /wishlist/count
 */
export const getWishlistCount = async () => {
  const response = await API.get('/wishlist/count');
  return response.data;
};

export default API;

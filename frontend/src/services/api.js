import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerCustomer = async (data) => (await API.post('/customers/register', data)).data;
export const loginCustomer = async (credentials) => (await API.post('/customers/login', credentials)).data;
export const getProfile = async () => (await API.get('/customers/me')).data;
export const logoutCustomer = async () => (await API.post('/customers/logout')).data;
export const changePassword = async (passwords) => (await API.patch('/customers/change-password', passwords)).data;

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = async (params = {}) => (await API.get('/products', { params })).data;
export const getProductById = async (id) => (await API.get(`/products/${id}`)).data;
export const createProduct = async (productData) => (await API.post('/products', productData)).data;

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const addToWishlist = async (productId) => (await API.post(`/wishlist/${productId}`)).data;
export const getWishlist = async () => (await API.get('/wishlist')).data;
export const removeFromWishlist = async (productId) => (await API.delete(`/wishlist/${productId}`)).data;
export const toggleWishlist = async (productId) => (await API.patch(`/wishlist/${productId}/toggle`)).data;
export const getWishlistCount = async () => (await API.get('/wishlist/count')).data;

// ── Cart ──────────────────────────────────────────────────────────────────────
export const addToCart = async (productId) => (await API.post(`/cart/${productId}`)).data;
export const getCart = async () => (await API.get('/cart')).data;
export const updateCartQuantity = async (productId, quantity) => (await API.patch(`/cart/${productId}`, { quantity })).data;
export const removeFromCart = async (productId) => (await API.delete(`/cart/${productId}`)).data;

// ── Orders ────────────────────────────────────────────────────────────────────
/** Lab 06: Create payment order — send shippingAddress only */
export const createPaymentOrder = async (shippingAddress) =>
  (await API.post('/orders/create-payment-order', { shippingAddress })).data;

/** Lab 06: Verify Razorpay payment signature */
export const verifyPayment = async (payload) =>
  (await API.post('/orders/verify-payment', payload)).data;

/** Lab 06: Get all orders for current user */
export const getMyOrders = async () => (await API.get('/orders')).data;

/** Lab 06: Get single order by ID */
export const getOrderById = async (id) => (await API.get(`/orders/${id}`)).data;

export default API;

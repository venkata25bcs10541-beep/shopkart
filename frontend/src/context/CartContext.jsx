import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartQuantity, removeFromCart } from '../services/api';

// ─── Context Creation ─────────────────────────────────────────────────────────
const CartContext = createContext(null);

/**
 * CartProvider — wraps the application and provides global cart state.
 * Lab 05 Task 6: Global Cart State (Context API approach)
 */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  // ─── Derived Values ───────────────────────────────────────────────────────
  // Total number of individual units in the cart (e.g. Keyboard×2 + Mouse×1 = 3)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal = Σ(product.price × quantity)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  // ─── Fetch Cart ───────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    setCartError('');
    try {
      const data = await getCart();
      setCartItems(data.cart ?? []);
    } catch (err) {
      // 401 = unauthenticated; silently clear cart (user not logged in yet)
      if (err?.response?.status === 401) {
        setCartItems([]);
      } else {
        setCartError('Unable to load your cart.');
      }
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Load cart once on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ─── Add to Cart ──────────────────────────────────────────────────────────
  const addItem = useCallback(async (productId) => {
    const data = await addToCart(productId);
    setCartItems(data.cart ?? []);
    return data;
  }, []);

  // ─── Remove from Cart ─────────────────────────────────────────────────────
  const removeItem = useCallback(async (productId) => {
    const data = await removeFromCart(productId);
    setCartItems(data.cart ?? []);
    return data;
  }, []);

  // ─── Update Quantity ──────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (productId, quantity) => {
    const data = await updateCartQuantity(productId, quantity);
    setCartItems(data.cart ?? []);
    return data;
  }, []);

  // ─── Clear Cart (for logout) ──────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        cartCount,
        subtotal,
        fetchCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * useCart — custom hook to consume cart context.
 * Usage: const { cartItems, addItem, removeItem, ... } = useCart();
 */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

export default CartContext;

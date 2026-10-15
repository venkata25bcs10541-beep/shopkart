import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';

/**
 * Lab 05 Task 8 — Cart Page (/cart)
 * Displays all cart items, quantity controls, order summary, and CTA.
 */
const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartError, subtotal, cartCount, fetchCart } = useCart();

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (cartLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-base font-semibold text-slate-700">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (cartError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="py-16 px-6 bg-white rounded-3xl border border-rose-200 text-center max-w-md w-full shadow-sm space-y-4">
          <div className="inline-flex p-3 bg-rose-100 text-rose-600 rounded-full">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Unable to load your cart</h2>
            <p className="text-sm text-slate-500 mt-1">{cartError}</p>
          </div>
          <button
            onClick={fetchCart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="py-20 px-6 bg-white rounded-3xl border border-slate-200 text-center max-w-md w-full shadow-sm space-y-5">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-400 rounded-full">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your cart is empty 🛒</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Looks like you haven't added anything yet. Browse products and start shopping!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ─── Cart with Items ────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-indigo-500" />
              My Cart
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 sticky top-24">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items ({cartCount} units)</span>
                  <span className="font-semibold text-slate-900">{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Subtotal</span>
                  <span className="text-xl font-extrabold text-indigo-600">
                    {formattedSubtotal}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Taxes and final charges calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

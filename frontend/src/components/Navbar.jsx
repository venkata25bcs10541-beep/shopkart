import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  LogOut,
  User as UserIcon,
  Heart,
  Home as HomeIcon,
  ShoppingCart,
} from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * Navbar — Lab 05 Task 9: Cart count badge integration.
 * The count is sourced from CartContext (global shared state),
 * so it updates automatically after any cart mutation without page refresh.
 */
const Navbar = ({ customer, setCustomer }) => {
  const navigate = useNavigate();
  const { cartCount, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (setCustomer) setCustomer(null);
      clearCart(); // Clear global cart state on logout
      navigate('/login');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to={customer ? '/home' : '/products'} className="flex items-center gap-2 group">
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:bg-indigo-700 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ShopKart
            </span>
          </Link>

          {/* Main Navigation Links */}
          <div className="flex items-center gap-6">
            {customer && (
              <Link
                to="/home"
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-1.5"
              >
                <HomeIcon className="w-4 h-4 text-slate-500" />
                <span>Home</span>
              </Link>
            )}
            <Link
              to="/products"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Products</span>
            </Link>
            <Link
              to="/wishlist"
              className="text-sm font-semibold text-slate-700 hover:text-rose-600 transition flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span>Wishlist</span>
            </Link>

            {/* Cart Link with Dynamic Count Badge (Lab 05 Task 9) */}
            <Link
              to="/cart"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-1.5 relative"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-indigo-500" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
            </Link>
          </div>

          {/* User Controls */}
          <nav className="flex items-center gap-4">
            {customer ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-900">{customer.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

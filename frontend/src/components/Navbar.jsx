import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, User as UserIcon } from 'lucide-react';
import { logoutCustomer } from '../services/api';

const Navbar = ({ customer, setCustomer }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (setCustomer) setCustomer(null);
      navigate('/login');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to={customer ? '/home' : '/login'} className="flex items-center gap-2 group">
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:bg-indigo-700 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ShopKart
            </span>
          </Link>

          {/* Main Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/products"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Products</span>
            </Link>
            {customer && (
              <Link
                to="/home"
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                Profile & Home
              </Link>
            )}
          </div>

          {/* User Controls & Navigation */}
          <nav className="flex items-center gap-4">
            {customer ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-900">{customer.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition"
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

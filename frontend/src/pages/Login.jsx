import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { loginCustomer } from '../services/api';

const Login = ({ setCustomer }) => {
  const navigate = useNavigate();

  // Controlled component state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await loginCustomer({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success) {
        if (setCustomer && response.customer) {
          setCustomer(response.customer);
        }
        // Navigate to protected home page
        navigate('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to your <span className="font-semibold text-indigo-600">ShopKart</span> account
          </p>
        </div>

        {/* Server Error Alert (e.g. Invalid credentials) */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 font-semibold text-sm transition shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect Link */}
        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

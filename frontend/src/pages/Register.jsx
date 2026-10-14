import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerCustomer } from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  // Controlled component state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must contain at least 6 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await registerCustomer({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (response.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join <span className="font-semibold text-indigo-600">ShopKart</span> to unlock exclusive shopping deals
          </p>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                  errors.fullName
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.fullName}</p>
            )}
          </div>

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
                placeholder="At least 6 characters"
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

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                  errors.phone
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.phone}</p>
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
                Creating account...
              </span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect Link */}
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

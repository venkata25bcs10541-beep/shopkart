import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Package,
  Heart,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getProfile, changePassword } from '../services/api';

const Home = ({ customer, setCustomer }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!customer);
  const [profile, setProfile] = useState(customer);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '', loading: false });

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        const data = await getProfile();
        if (isMounted) {
          setProfile(data);
          if (setCustomer) setCustomer(data);
        }
      } catch (err) {
        console.error('Failed to authenticate customer:', err);
        if (isMounted) {
          if (setCustomer) setCustomer(null);
          // Redirect unauthenticated user to login
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setCustomer]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ error: '', success: '', loading: true });

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordStatus({ error: 'Both old and new passwords are required', success: '', loading: false });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ error: 'New password must be at least 6 characters', success: '', loading: false });
      return;
    }

    try {
      const res = await changePassword(passwordData);
      setPasswordStatus({ error: '', success: res.message || 'Password changed successfully!', loading: false });
      setPasswordData({ oldPassword: '', newPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setPasswordStatus({ error: msg, success: '', loading: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Verifying customer credentials...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-indigo-100 mb-4">
              <ShieldCheck className="w-4 h-4" /> Authenticated Customer
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {profile.fullName}! 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Explore today's exclusive offers, manage your cart, and track your recent orders across ShopKart.
            </p>
          </div>

          <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
            <ShoppingBag className="w-80 h-80" />
          </div>
        </div>

        {/* Customer Account Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Customer Profile</h2>
              <p className="text-sm text-slate-500">Live verified information from MongoDB</p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
            >
              <KeyRound className="w-4 h-4" />
              Change Password
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Full Name */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Full Name</p>
                <p className="text-base font-semibold text-slate-900 mt-0.5">{profile.fullName}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Email Address</p>
                <p className="text-base font-semibold text-slate-900 mt-0.5 truncate">{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Phone Number</p>
                <p className="text-base font-semibold text-slate-900 mt-0.5">{profile.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* E-Commerce Dashboard Cards Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Cart Items</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Orders</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Wishlist</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Wallet</p>
              <p className="text-2xl font-bold text-slate-900">₹0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500 mt-1">Update your ShopKart account password securely.</p>

            {passwordStatus.error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50"
                >
                  {passwordStatus.loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

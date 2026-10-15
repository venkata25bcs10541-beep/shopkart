import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, User, Phone, Home, Building2, Map, Hash,
  ShoppingBag, ArrowRight, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

/**
 * Lab 06 Task 2 & 3 — Checkout Page (/checkout)
 * Shipping form + order summary + place order flow.
 * Uses simulation mode when Razorpay keys are absent.
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart, fetchCart } = useCart();

  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState('');

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(subtotal);

  // ── Validation (Task 3) ────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.trim())) errs.phone = 'Phone must be a 10-digit number';
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = 'Pincode must contain 6 digits';
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  // ── Place Order Handler ────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (cartItems.length === 0) {
      setApiError('Your cart is empty.');
      return;
    }

    setPlacing(true);
    setApiError('');

    try {
      // Step 1: Create payment order on backend
      const data = await createPaymentOrder(form);
      const { order, razorpay: rzp } = data;

      // Step 2: Open Razorpay checkout or simulate
      if (rzp.orderId.startsWith('sim_') || rzp.keyId === 'rzp_test_simulation') {
        // Simulation mode — directly verify without Razorpay UI
        await handleVerify({
          orderId: order._id,
          razorpayOrderId: rzp.orderId,
          razorpayPaymentId: `sim_pay_${Date.now()}`,
          razorpaySignature: 'simulated',
        });
      } else {
        // Real Razorpay checkout
        openRazorpay(rzp, order._id);
      }
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  const openRazorpay = (rzp, orderId) => {
    const options = {
      key: rzp.keyId,
      amount: rzp.amount,
      currency: rzp.currency,
      order_id: rzp.orderId,
      name: 'ShopKart',
      description: 'Purchase',
      handler: async (response) => {
        await handleVerify({
          orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      prefill: {
        name: rzp.customerName,
        email: rzp.customerEmail,
        contact: rzp.customerPhone,
      },
      theme: { color: '#4F46E5' },
      modal: {
        ondismiss: () => {
          setPlacing(false);
          setApiError('Payment was cancelled.');
        },
      },
    };

    if (window.Razorpay) {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } else {
      setApiError('Razorpay SDK not loaded. Please refresh and try again.');
      setPlacing(false);
    }
  };

  const handleVerify = async ({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    try {
      const result = await verifyPayment({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (result.success) {
        clearCart(); // Clear global cart state
        await fetchCart(); // Sync with backend (will return empty cart)
        navigate(`/orders/${orderId}`, { state: { success: true } });
      }
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Payment verification failed.');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0 && !placing) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-700">Your cart is empty</h2>
          <button onClick={() => navigate('/products')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const fields = [
    { name: 'fullName', label: 'Full Name', icon: User, placeholder: 'Aarav Sharma' },
    { name: 'phone', label: 'Phone Number', icon: Phone, placeholder: '9876543210' },
    { name: 'addressLine1', label: 'Address Line', icon: Home, placeholder: '22 MG Road' },
    { name: 'city', label: 'City', icon: Building2, placeholder: 'Bengaluru' },
    { name: 'state', label: 'State', icon: Map, placeholder: 'Karnataka' },
    { name: 'pincode', label: 'Pincode', icon: Hash, placeholder: '560001' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-indigo-500" />
            Checkout
          </h1>
          <p className="text-sm text-slate-500 mt-1">Enter your shipping details to place the order</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-700">{apiError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-indigo-500" />
              Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ name, label, icon: Icon, placeholder }) => (
                <div key={name} className={name === 'addressLine1' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                        errors[name] ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>
                  {errors[name] && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors[name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 sticky top-24">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=100&q=80'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-slate-500">× {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold text-indigo-600">{formattedTotal}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
              >
                {placing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Placing Order...</span></>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /><span>Place Order</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Secured by Razorpay · Test Mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

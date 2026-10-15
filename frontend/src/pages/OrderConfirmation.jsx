import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
  CheckCircle2, Package, MapPin, ArrowRight, ShoppingBag, Loader2, AlertCircle,
} from 'lucide-react';
import { getOrderById } from '../services/api';

/**
 * Lab 06 — Order Confirmation Page (/orders/:id)
 * Shown after successful payment. Also reachable from My Orders.
 */
const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const isSuccess = location.state?.success;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-sm w-full space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm text-slate-600">{error}</p>
          <Link to="/orders" className="text-sm font-semibold text-indigo-600 hover:underline">← My Orders</Link>
        </div>
      </div>
    );
  }

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Success Banner */}
        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-extrabold text-emerald-800">Order Placed! 🎉</h1>
            <p className="text-sm text-emerald-700">Your payment was successful and your order is confirmed.</p>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Order Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">ID: {order._id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
              order.paymentStatus === 'FAILED' ? 'bg-rose-100 text-rose-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {order.paymentStatus}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">× {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-slate-900">{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Paid</span>
            <span className="text-xl font-extrabold text-indigo-600">{fmt(order.totalAmount)}</span>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Shipping Address
              </p>
              <p className="text-sm text-slate-700 font-semibold">{order.shippingAddress.fullName}</p>
              <p className="text-xs text-slate-600">{order.shippingAddress.addressLine1}</p>
              <p className="text-xs text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
              <p className="text-xs text-slate-600">{order.shippingAddress.phone}</p>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Link to="/orders" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">
            <Package className="w-4 h-4" /> My Orders
          </Link>
          <Link to="/products" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition">
            <ShoppingBag className="w-4 h-4" /> Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

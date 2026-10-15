import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ShoppingBag, ArrowRight, Loader2, AlertCircle, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { getMyOrders } from '../services/api';

/**
 * Lab 06 — My Orders Page (/orders)
 * Lists all past orders for the authenticated user.
 */
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyOrders();
      setOrders(data.orders ?? []);
    } catch (err) {
      if (err?.response?.status === 401) navigate('/login');
      else setError('Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-sm w-full space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm text-slate-600">{error}</p>
          <button onClick={fetchOrders} className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-sm w-full space-y-5">
          <Package className="w-14 h-14 text-slate-300 mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">No orders yet</h2>
            <p className="text-sm text-slate-500 mt-1">Your completed orders will appear here.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition">
            <ShoppingBag className="w-4 h-4" /> Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-500" />
            My Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">Order ID</p>
                <p className="text-sm font-bold text-slate-900 font-mono">{order._id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{fmtDate(order.createdAt)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                  order.paymentStatus === 'FAILED' ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {order.paymentStatus === 'PAID' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items preview */}
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                  )}
                  <p className="text-sm text-slate-700 flex-1 line-clamp-1">
                    {item.name} <span className="text-slate-400">× {item.quantity}</span>
                  </p>
                  <span className="text-sm font-semibold text-slate-900">
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-slate-400">+ {order.items.length - 3} more item(s)</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-900">Total: {fmt(order.totalAmount)}</span>
              <Link
                to={`/orders/${order._id}`}
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import WishlistCard from '../components/WishlistCard';
import { getWishlist, removeFromWishlist } from '../services/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const fetchWishlistData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getWishlist();
      if (data && Array.isArray(data.wishlist)) {
        // Filter out any null/undefined products if a product was deleted
        const validItems = data.wishlist.filter(Boolean);
        setWishlist(validItems);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      if (err.response && err.response.status === 401) {
        // Redirect unauthenticated user to login
        navigate('/login');
      } else {
        setError("Unable to load wishlist. We couldn't retrieve your saved items.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, [navigate]);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      setNotification('Product removed from wishlist');
      setTimeout(() => setNotification(''), 2500);
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
      setNotification('Failed to remove item. Please try again.');
      setTimeout(() => setNotification(''), 2500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your saved items to review, compare, and purchase whenever you're ready
            </p>
          </div>

          {!loading && !error && wishlist.length > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>
                {wishlist.length} {wishlist.length === 1 ? 'product saved' : 'products saved'}
              </span>
            </div>
          )}
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className="p-3 bg-slate-800 text-white text-xs font-semibold rounded-xl text-center shadow-lg max-w-sm mx-auto animate-fade-in">
            {notification}
          </div>
        )}

        {/* Loading State (Task 7) */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base font-semibold text-slate-700">Loading your wishlist...</p>
            <p className="text-xs text-slate-400">Fetching your saved products from ShopKart</p>
          </div>
        )}

        {/* Error State (Task 7) */}
        {!loading && error && (
          <div className="py-16 px-6 bg-white rounded-3xl border border-rose-200 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="inline-flex p-3 bg-rose-100 text-rose-600 rounded-full">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchWishlistData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State (Task 7 & 9) */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="py-20 px-6 bg-white rounded-3xl border border-slate-200 text-center max-w-md mx-auto shadow-sm space-y-5">
            <div className="inline-flex p-4 bg-rose-50 text-rose-500 rounded-full">
              <Heart className="w-12 h-12 fill-rose-500/20 text-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your wishlist is empty ❤️</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Save products you love while browsing, and find them easily here later whenever you're ready to buy.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20 transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Cards Grid — Rendered Dynamically via .map() */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * ProductCard — Lab 05 Task 7: "Add to Cart" button integration.
 * Uses CartContext so cart count in Navbar updates immediately.
 */
const ProductCard = ({ product, initialWishlisted = false, onWishlistChange }) => {
  const { _id, name, price, category, image, stock } = product;
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  // ─── Wishlist Handler ─────────────────────────────────────────────────────
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    setFeedback({ error: '', success: '' });
    try {
      const res = await toggleWishlist(_id);
      setIsWishlisted(res.saved);
      setFeedback({
        error: '',
        success: res.saved ? 'Added to Wishlist' : 'Removed from Wishlist',
      });
      if (onWishlistChange) onWishlistChange(_id, res.saved);
      setTimeout(() => setFeedback({ error: '', success: '' }), 2500);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 409) {
        setIsWishlisted(true);
        setFeedback({ error: '', success: 'Already in Wishlist' });
        setTimeout(() => setFeedback({ error: '', success: '' }), 2500);
      } else {
        setFeedback({ error: 'Unable to save product. Please try again.', success: '' });
        setTimeout(() => setFeedback({ error: '', success: '' }), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Add to Cart Handler ───────────────────────────────────────────────────
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingToCart || isOutOfStock) return;
    setAddingToCart(true);
    setFeedback({ error: '', success: '' });
    try {
      await addItem(_id);
      setFeedback({ error: '', success: 'Added to Cart!' });
      setTimeout(() => setFeedback({ error: '', success: '' }), 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setFeedback({
          error: err.response?.data?.message || 'Could not add to cart',
          success: '',
        });
        setTimeout(() => setFeedback({ error: '', success: '' }), 3000);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
            <Tag className="w-3 h-3 text-indigo-600" />
            {category}
          </span>
        </div>

        {/* Top-Right Floating Quick-Wishlist Heart */}
        <button
          onClick={handleWishlistClick}
          disabled={saving}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Heart
              className={`w-4 h-4 transition ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
            />
          )}
        </button>

        {/* Stock Badge Overlay */}
        <div className="absolute bottom-3 left-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Only {stock} left
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500 text-white shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> In Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{category}</p>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <p className="text-xl font-extrabold text-slate-900">{formattedPrice}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Availability</span>
            <p className="text-xs font-semibold text-slate-600">
              {isOutOfStock ? '0 units' : `${stock} units left`}
            </p>
          </div>
        </div>

        {/* Feedback Message Banner */}
        {feedback.error && (
          <div className="p-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium text-center">
            {feedback.error}
          </div>
        )}
        {feedback.success && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{feedback.success}</span>
          </div>
        )}

        {/* Action Buttons: [View Details] [Add to Cart] [♡ Wishlist] */}
        <div className="space-y-2 pt-1">
          {/* Add to Cart — full width, primary CTA */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isOutOfStock}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }`}
          >
            {addingToCart ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </>
            )}
          </button>

          {/* Secondary row: View Details + Wishlist */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${_id}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 active:scale-[0.98] transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>

            <button
              onClick={handleWishlistClick}
              disabled={saving}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Saving...</span>
                </>
              ) : isWishlisted ? (
                <>
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Wishlisted</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 text-slate-500" />
                  <span>Wishlist</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

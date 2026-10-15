import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * Lab 05 Task 8 — CartItem component
 * Displays a single cart row with quantity controls and remove button.
 */
const CartItem = ({ item }) => {
  const { product, quantity } = item;
  const { updateQuantity, removeItem } = useCart();

  const [updatingQty, setUpdatingQty] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedLineTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price * quantity);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleIncrease = async () => {
    if (updatingQty) return;
    if (quantity >= product.stock) {
      showFeedback(`Max stock: ${product.stock}`);
      return;
    }
    setUpdatingQty(true);
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      showFeedback(err?.response?.data?.message || 'Could not update quantity');
    } finally {
      setUpdatingQty(false);
    }
  };

  const handleDecrease = async () => {
    if (updatingQty || quantity <= 1) return; // Use Remove for qty = 1
    setUpdatingQty(true);
    try {
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      showFeedback(err?.response?.data?.message || 'Could not update quantity');
    } finally {
      setUpdatingQty(false);
    }
  };

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await removeItem(product._id);
    } catch (err) {
      showFeedback('Could not remove item');
      setRemoving(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-xl border border-slate-100 bg-slate-50"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80';
          }}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            to={`/products/${product._id}`}
            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
          <p className="text-sm font-semibold text-indigo-600 mt-1">{formattedPrice} each</p>
        </div>

        {feedback && (
          <p className="text-[11px] text-rose-600 font-medium mt-1">{feedback}</p>
        )}

        {/* Quantity Controls + Remove */}
        <div className="flex items-center justify-between mt-3">
          {/* [-] qty [+] */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={updatingQty || quantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-8 text-center text-sm font-bold text-slate-900">
              {updatingQty ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 mx-auto" />
              ) : (
                quantity
              )}
            </span>

            <button
              onClick={handleIncrease}
              disabled={updatingQty || quantity >= product.stock}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Line Total + Remove */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-slate-900">{formattedLineTotal}</span>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition disabled:opacity-50 cursor-pointer"
              title="Remove from cart"
            >
              {removing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

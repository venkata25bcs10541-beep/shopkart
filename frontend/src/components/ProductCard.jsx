import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { _id, name, price, category, image, stock } = product;

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback image if remote image fails to load
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
            <Tag className="w-3 h-3 text-indigo-600" />
            {category}
          </span>
        </div>

        {/* Stock Badge Overlay */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Only {stock} left
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white shadow-sm flex items-center gap-1">
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

        {/* Action Button */}
        <Link
          to={`/products/${_id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition shadow-sm group-hover:shadow-md cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;

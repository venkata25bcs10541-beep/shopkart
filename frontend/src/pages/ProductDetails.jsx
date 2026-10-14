import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  AlertCircle,
  PackageX,
} from 'lucide-react';
import { getProductById } from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getProductById(id);
        if (isMounted) {
          const prod = data.product || data;
          setProduct(prod);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (isMounted) {
          if (err.response && err.response.status === 404) {
            setError('Product not found.');
          } else if (err.response && err.response.status === 400) {
            setError('Invalid product ID provided.');
          } else {
            setError('Something went wrong while loading this product.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const incrementQty = () => {
    if (product && quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-base font-semibold text-slate-700">Loading product details...</p>
        <p className="text-xs text-slate-400">Fetching specification and stock from ShopKart</p>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-sm space-y-4">
          <div className="inline-flex p-3 bg-rose-100 text-rose-600 rounded-full">
            <PackageX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{error || 'Product Not Found'}</h2>
          <p className="text-sm text-slate-500">
            The product you are trying to view does not exist or may have been removed.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/products" className="hover:text-indigo-600 flex items-center gap-1 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Products
          </Link>
          <span>/</span>
          <span className="text-slate-400">{category}</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs">{name}</span>
        </nav>

        {/* Product Details Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 lg:p-10">
          {/* Large Product Image Container */}
          <div className="relative aspect-[4/3] md:aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                {category}
              </span>
            </div>
          </div>

          {/* Product Info & Actions Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Stock Pill */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {category}
                </span>

                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {stock} units available
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {formattedPrice}
                </span>
                <span className="text-xs text-slate-400 font-medium">Inclusive of all taxes</span>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Description
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart (Task 8) */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                  <button
                    onClick={decrementQty}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={incrementQty}
                    disabled={quantity >= stock || isOutOfStock}
                    className="p-2 text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}</span>
              </button>

              {/* Notification Toast */}
              {addedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Added <strong>{quantity}x {name}</strong> to your shopping cart!
                  </span>
                </div>
              )}

              {/* E-commerce Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 text-center border-t border-slate-100">
                <div className="p-2 rounded-xl bg-slate-50 flex flex-col items-center text-xs text-slate-500">
                  <Truck className="w-4 h-4 text-indigo-600 mb-1" />
                  <span>Free Delivery</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 flex flex-col items-center text-xs text-slate-500">
                  <Shield className="w-4 h-4 text-indigo-600 mb-1" />
                  <span>1 Year Warranty</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 flex flex-col items-center text-xs text-slate-500">
                  <RotateCcw className="w-4 h-4 text-indigo-600 mb-1" />
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

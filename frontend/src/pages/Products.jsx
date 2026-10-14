import React, { useState, useEffect } from 'react';
import { ShoppingBag, AlertCircle, RefreshCw, PackageX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('');

  // Fetch products with debounce on search
  useEffect(() => {
    let isMounted = true;
    const delayTimer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (selectedCategory && selectedCategory !== 'All Categories') {
          params.category = selectedCategory;
        }
        if (selectedSort) {
          params.sort = selectedSort;
        }

        const data = await getProducts(params);
        if (isMounted) {
          if (data && Array.isArray(data.products)) {
            setProducts(data.products);
          } else if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (isMounted) {
          setError('Something went wrong while loading products.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce for smooth search typing

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);
    };
  }, [searchTerm, selectedCategory, selectedSort]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedSort('');
  };

  const handleRetry = () => {
    setSearchTerm((prev) => prev); // re-trigger fetch
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
              Product Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover and shop from our extensive range of high-quality products
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          onReset={handleResetFilters}
        />

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base font-semibold text-slate-700">Loading products...</p>
            <p className="text-xs text-slate-400">Fetching the latest catalog from ShopKart</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-16 px-4 bg-white rounded-3xl border border-rose-200 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="inline-flex p-3 bg-rose-100 text-rose-600 rounded-full">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Oops! Failed to Load</h3>
              <p className="text-sm text-slate-600 mt-1">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="py-16 px-4 bg-white rounded-3xl border border-slate-200 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="inline-flex p-3 bg-slate-100 text-slate-500 rounded-full">
              <PackageX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No products found.</h3>
              <p className="text-sm text-slate-500 mt-1">
                We couldn't find any products matching your current search or category filter.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Product Cards Grid — Dynamic Rendering via .map() */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import API from '../../utils/api';
import ProductCard from '../../components/customer/ProductCard';

const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Newest First' },
  { value: 'price-ASC',       label: 'Price: Low to High' },
  { value: 'price-DESC',      label: 'Price: High to Low' },
  { value: 'rating-DESC',     label: 'Top Rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [pagination,  setPagination]  = useState({});
  const [loading,     setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const currentPage     = Number(searchParams.get('page') || 1);
  const currentCategory = searchParams.get('category') || '';
  const currentSearch   = searchParams.get('search')   || '';
  const currentSort     = searchParams.get('sort')     || 'created_at-DESC';
  const currentType     = searchParams.get('type')     || '';
  const currentFeatured = searchParams.get('featured') || '';
  const minPrice        = searchParams.get('minPrice') || '';
  const maxPrice        = searchParams.get('maxPrice') || '';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const [sortField, sortOrder] = currentSort.split('-');
    try {
      const { data } = await API.get('/products', {
        params: {
          page: currentPage, limit: 12,
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          sort: sortField, order: sortOrder,
          type: currentType || undefined,
          featured: currentFeatured || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        }
      });
      setProducts(data.products);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [currentPage, currentCategory, currentSearch, currentSort, currentType, currentFeatured, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { API.get('/categories').then(r => setCategories(r.data)); }, []);

  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-semibold text-gray-800 text-sm mb-3">Category</h4>
        <div className="space-y-1.5">
          <button onClick={() => updateParam('category', '')} className={`block text-sm w-full text-left px-2 py-1.5 rounded transition ${!currentCategory ? 'text-orange-500 font-medium bg-orange-50' : 'text-gray-600 hover:text-orange-500'}`}>
            All Categories
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => updateParam('category', c.slug)} className={`block text-sm w-full text-left px-2 py-1.5 rounded transition ${currentCategory === c.slug ? 'text-orange-500 font-medium bg-orange-50' : 'text-gray-600 hover:text-orange-500'}`}>
              {c.name} <span className="text-gray-400">({c.product_count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Type */}
      <div>
        <h4 className="font-semibold text-gray-800 text-sm mb-3">Product Type</h4>
        <div className="space-y-1.5">
          {[['', 'All Types'], ['physical', '📦 Physical'], ['digital', '💻 Digital']].map(([val, label]) => (
            <button key={val} onClick={() => updateParam('type', val)} className={`block text-sm w-full text-left px-2 py-1.5 rounded transition ${currentType === val ? 'text-orange-500 font-medium bg-orange-50' : 'text-gray-600 hover:text-orange-500'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-gray-800 text-sm mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={e => updateParam('minPrice', e.target.value)} className="input-field w-1/2 text-sm" />
          <span className="text-gray-400">—</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={e => updateParam('maxPrice', e.target.value)} className="input-field w-1/2 text-sm" />
        </div>
      </div>

      {/* Clear */}
      {(currentCategory || currentType || minPrice || maxPrice || currentFeatured) && (
        <button onClick={() => setSearchParams({})} className="w-full text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 justify-center border border-red-200 rounded-lg py-2">
          <FiX size={14} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentSearch ? `Results for "${currentSearch}"` : 'All Products'}
          </h1>
          {pagination.total !== undefined && (
            <p className="text-sm text-gray-500 mt-0.5">{pagination.total} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select value={currentSort} onChange={e => updateParam('sort', e.target.value)} className="input-field pr-8 text-sm appearance-none bg-white cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FiChevronDown className="absolute right-2 top-3 text-gray-400 pointer-events-none" size={16} />
          </div>
          {/* Mobile filter toggle */}
          <button onClick={() => setShowFilters(v => !v)} className="md:hidden btn-outline text-sm py-2 flex items-center gap-2">
            <FiFilter size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar filters */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><FiFilter size={16} /> Filters</h3>
            <FiltersPanel />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)}><FiX /></button>
              </div>
              <FiltersPanel />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="bg-gray-200 h-44 rounded-lg mb-4" />
                  <div className="bg-gray-200 h-4 rounded mb-2" />
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', page); setSearchParams(n); }}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === currentPage ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

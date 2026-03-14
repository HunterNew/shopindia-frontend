import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/products', { params: { page, limit: LIMIT, search: search || undefined } });
      setProducts(data.products);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the store?`)) return;
    try {
      await API.delete(`/admin/products/${id}`);
      toast.success('Product removed');
      load();
    } catch { toast.error('Failed to remove'); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} products total</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or SKU…"
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No products found. <Link to="/admin/products/new" className="text-orange-500 hover:underline">Add your first product →</Link>
                  </td>
                </tr>
              ) : products.map(p => {
                const img = p.images?.[0]?.url;
                const isLowStock = p.product_type === 'physical' && p.stock_quantity <= p.low_stock_threshold;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {img
                          ? <img src={img} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                          : <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-lg">📦</div>
                        }
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.name}</p>
                          {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.category_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">₹{Number(p.price).toLocaleString('en-IN')}</span>
                      {p.compare_price && <span className="block text-xs text-gray-400 line-through">₹{Number(p.compare_price).toLocaleString('en-IN')}</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.product_type === 'digital'
                        ? <span className="text-purple-600 font-medium">∞</span>
                        : <span className={`font-medium ${isLowStock ? 'text-red-500' : 'text-gray-800'}`}>
                            {p.stock_quantity}
                            {isLowStock && <FiAlertTriangle size={12} className="inline ml-1" />}
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.product_type === 'digital'
                        ? <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1 w-fit"><FiDownload size={10} />Digital</span>
                        : <span className="badge bg-blue-100 text-blue-700 w-fit">Physical</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${p.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <FiEdit2 size={15} />
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Categories.js ───────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiX, FiSave } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | category object
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/categories'); setCategories(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: '', description: '' }); setModal('new'); };
  const openEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || '',
      is_active: cat.is_active
    });
    setModal(cat);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'new') {
        await API.post('/admin/categories', form);
        toast.success('Category created');
      } else {
        await API.put(`/admin/categories/${modal.id}`, form);
        toast.success('Category updated');
      }
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  // const remove = async (id, name) => {
  //   if (!window.confirm(`Remove category "${name}"?`)) return;
  //   try { await API.delete(`/admin/categories/${id}`); toast.success('Removed'); load(); }
  //   catch { toast.error('Failed'); }
  // };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><FiPlus size={16} />Add Category</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Products</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
              ))
            ) : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{cat.description || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{cat.product_count}</td>
                <td className="px-4 py-3">
                  {/* <span className={`badge ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </span> */}

                  <button
                    onClick={() => {
                      API.put(`/admin/categories/${cat.id}`, { is_active: !cat.is_active })
                        .then(() => { toast.success(cat.is_active ? 'Category hidden from store' : 'Category shown in store'); load(); })
                        .catch(() => toast.error('Failed'));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${cat.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600'
                      : 'bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700'
                      }`}
                  >
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><FiEdit2 size={15} /></button>
                    {/* <button
                      onClick={() => {
                        API.put(`/admin/categories/${cat.id}`, { is_active: !cat.is_active })
                          .then(() => { toast.success(cat.is_active ? 'Category hidden from store' : 'Category shown in store'); load(); })
                          .catch(() => toast.error('Failed'));
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${cat.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600'
                        : 'bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700'
                        }`}
                    >
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">{modal === 'new' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Category name" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Short description" />
              </div>

              {/* ── Active Toggle ── */}
              {modal !== 'new' && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Active Status</p>
                    <p className="text-xs text-gray-400">{form.is_active ? 'Visible in store' : 'Hidden from store'}</p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${form.is_active ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.is_active ? 'translate-x-5 ml-0.5' : 'translate-x-0 ml-0.5'
                      }`} />
                  </div>
                </div>
              )}

            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <FiSave size={14} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

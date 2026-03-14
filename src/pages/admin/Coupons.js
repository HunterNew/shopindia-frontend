import React, { useEffect, useState } from 'react';
import { FiPlus, FiToggleLeft, FiToggleRight, FiX, FiSave, FiGift } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const empty = { code: '', type: 'percentage', value: '', min_order_amount: '', max_discount: '', usage_limit: '', expires_at: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(empty);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    const { data } = await API.get('/admin/coupons');
    setCoupons(data);
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return; }
    setSaving(true);
    try {
      await API.post('/admin/coupons', form);
      toast.success('Coupon created!');
      setModal(false);
      setForm(empty);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggle = async (coupon) => {
    try {
      await API.put(`/admin/coupons/${coupon.id}`, { is_active: !coupon.is_active });
      toast.success(coupon.is_active ? 'Coupon disabled' : 'Coupon enabled');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><FiPlus size={16} />New Coupon</button>
      </div>

      {coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <FiGift size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 mb-4">No coupons yet. Create your first discount code!</p>
          <button onClick={() => setModal(true)} className="btn-primary inline-flex items-center gap-2"><FiPlus size={14} />Create Coupon</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Min Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Usage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Expires</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} off
                    {c.max_discount && <span className="text-xs text-gray-400 block">max ₹{c.max_discount}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">₹{c.min_order_amount}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                    {c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ''} used
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => toggle(c)} className={`text-xl transition ${c.is_active ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}>
                      {c.is_active ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">New Coupon</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Coupon Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="input-field font-mono" placeholder="e.g. SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Discount Type</label>
                  <select value={form.type} onChange={set('type')} className="input-field text-sm">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Value *</label>
                  <input type="number" min="0" value={form.value} onChange={set('value')} className="input-field" placeholder={form.type === 'percentage' ? '10' : '50'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Min Order (₹)</label>
                  <input type="number" min="0" value={form.min_order_amount} onChange={set('min_order_amount')} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Max Discount (₹)</label>
                  <input type="number" min="0" value={form.max_discount} onChange={set('max_discount')} className="input-field" placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Usage Limit</label>
                  <input type="number" min="0" value={form.usage_limit} onChange={set('usage_limit')} className="input-field" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Expires On</label>
                  <input type="date" value={form.expires_at} onChange={set('expires_at')} className="input-field text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <FiSave size={14} />{saving ? 'Creating…' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

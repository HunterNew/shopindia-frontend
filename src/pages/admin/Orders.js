import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState('');
  const [search,  setSearch]  = useState('');
  const [expanded, setExpanded] = useState(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/orders', {
        params: { page, limit: LIMIT, status: status || undefined, search: search || undefined }
      });
      setOrders(data.orders);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      load();
    } catch { toast.error('Update failed'); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} orders total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Order number, customer…" className="input-field pl-9 text-sm" />
        </div>
        <div className="relative">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field text-sm pr-8 appearance-none bg-white cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
          </select>
          <FiChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
            ) : orders.map(order => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{order.order_number}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.payment_method === 'cod' ? 'COD' : 'PhonePe'}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-700">{order.customer_name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer focus:ring-2 focus:ring-orange-300 focus:outline-none"
                      >
                        {STATUSES.filter(Boolean).map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
                {/* Expanded detail row */}
                {expanded === order.id && (
                  <tr>
                    <td colSpan={7} className="bg-orange-50 px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">ORDER DETAILS</p>
                          <p>Subtotal: ₹{Number(order.subtotal).toLocaleString('en-IN')}</p>
                          <p>Shipping: {Number(order.shipping_charge) === 0 ? 'FREE' : `₹${order.shipping_charge}`}</p>
                          <p>GST: ₹{Number(order.tax).toLocaleString('en-IN')}</p>
                          {Number(order.discount) > 0 && <p className="text-green-600">Discount: −₹{Number(order.discount).toLocaleString('en-IN')}</p>}
                          <p className="font-bold mt-1">Total: ₹{Number(order.total).toLocaleString('en-IN')}</p>
                        </div>
                        {order.shipping_address && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">SHIPPING ADDRESS</p>
                            <p>{order.shipping_address.full_name}</p>
                            <p>{order.shipping_address.phone}</p>
                            <p>{order.shipping_address.address_line1}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">NOTES</p>
                            <p className="text-gray-700">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
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

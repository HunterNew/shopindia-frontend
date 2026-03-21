import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const METHODS  = ['', 'whatsapp', 'cod', 'razorpay', 'phonepe'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

const PAYMENT_LABELS = {
  cod:      '💵 COD',
  whatsapp: '📱 WhatsApp',
  razorpay: '💳 Razorpay',
  phonepe:  '📲 PhonePe',
};

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [status,   setStatus]   = useState('');
  const [method,   setMethod]   = useState('');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);
  const LIMIT = 20;
  const [orderItems, setOrderItems] = useState({}); // cache: { orderId: items[] }

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) return; // already loaded
    try {
      const { data } = await API.get(`/admin/orders/${orderId}/items`);
      setOrderItems(prev => ({ ...prev, [orderId]: data }));
    } catch {
      setOrderItems(prev => ({ ...prev, [orderId]: [] }));
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/orders', {
        params: {
          page, limit: LIMIT,
          status:         status || undefined,
          payment_method: method || undefined,
          search:         search || undefined
        }
      });
      setOrders(data.orders);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [page, status, method, search]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId, newStatus, newPaymentStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, {
        status:         newStatus        || undefined,
        payment_status: newPaymentStatus || undefined
      });
      toast.success('Order updated');
      load();
    } catch { toast.error('Update failed'); }
  };

  const pages = Math.ceil(total / LIMIT);

  // Count WhatsApp pending orders for badge
  const whatsappPending = orders.filter(o => o.payment_method === 'whatsapp' && o.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Orders
            {whatsappPending > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {whatsappPending} WhatsApp
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} orders total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order number, customer name, email..."
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input-field text-sm pr-8 appearance-none bg-white cursor-pointer"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
        </div>
        <div className="relative">
          <select
            value={method}
            onChange={e => { setMethod(e.target.value); setPage(1); }}
            className="input-field text-sm pr-8 appearance-none bg-white cursor-pointer"
          >
            {METHODS.map(m => (
              <option key={m} value={m}>
                {m ? PAYMENT_LABELS[m] || m : 'All Payments'}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Items</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td>
              </tr>
            ) : orders.map(order => (
              <React.Fragment key={order.id}>
                <tr
                  className={`hover:bg-gray-50 transition cursor-pointer ${
                    order.payment_method === 'whatsapp' && order.status === 'pending'
                      ? 'bg-green-50/40 border-l-2 border-l-green-400'
                      : ''
                  }`}
                  onClick={() => {
                    const newId = expanded === order.id ? null : order.id;
                    setExpanded(newId);
                    if (newId) fetchOrderItems(newId);
                  }}
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800 text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-700 text-sm">{order.customer_name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {/* Item summary */}
                    <div className="max-w-[160px]">
                      <p className="text-xs font-medium text-gray-700">
                        {order.item_count || 0} item{order.item_count !== 1 ? 's' : ''}
                      </p>
                      {order.item_names && (
                        <p className="text-xs text-gray-400 truncate mt-0.5" title={order.item_names}>
                          {order.item_names}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    ₹{Number(order.total).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : order.payment_status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value, null)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer focus:ring-2 focus:ring-orange-300 focus:outline-none"
                    >
                      {STATUSES.filter(Boolean).map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* ── Expanded Detail Row ── */}
                {expanded === order.id && (
                  <tr>
                    <td colSpan={7} className="bg-gray-50 px-6 py-5 border-b border-gray-100">
                      {/* ── Order Items ── */}
                      {orderItems[order.id] && orderItems[order.id].length > 0 && (
                        <div className="mb-5">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Items Ordered ({orderItems[order.id].length})</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {orderItems[order.id].map((item, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                                {item.product_image
                                  ? <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                                  : <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">📦</div>
                                }
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{item.product_name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${item.product_type === 'digital' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {item.product_type === 'digital' ? '💻 Digital' : '📦 Physical'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                                    <span className="font-semibold text-gray-800 ml-1">= ₹{Number(item.total).toLocaleString('en-IN')}</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {orderItems[order.id] && orderItems[order.id].length === 0 && (
                        <p className="text-xs text-gray-400 mb-4">No items found</p>
                      )}
                      {!orderItems[order.id] && (
                        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                          Loading items...
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

                        {/* Order details */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Order Details</p>
                          <div className="space-y-1 text-gray-700">
                            <p>Subtotal: ₹{Number(order.subtotal).toLocaleString('en-IN')}</p>
                            <p>Shipping: {Number(order.shipping_charge) === 0 ? 'FREE' : `₹${order.shipping_charge}`}</p>
                            <p>GST: ₹{Number(order.tax).toLocaleString('en-IN')}</p>
                            {Number(order.discount) > 0 && <p className="text-green-600">Discount: −₹{Number(order.discount)}</p>}
                            <p className="font-bold text-gray-900">Total: ₹{Number(order.total).toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        {/* Shipping address */}
                        {order.shipping_address && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Shipping Address</p>
                            <div className="text-gray-700 space-y-0.5">
                              <p className="font-medium">{order.shipping_address.full_name}</p>
                              <p>{order.shipping_address.phone}</p>
                              <p>{order.shipping_address.address_line1}</p>
                              {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                              <p>Pincode: {order.shipping_address.pincode}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions for WhatsApp orders */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Quick Actions</p>
                          <div className="space-y-2">
                            {/* Mark as Paid */}
                            {order.payment_status !== 'paid' && (
                              <button
                                onClick={() => updateStatus(order.id, 'confirmed', 'paid')}
                                className="w-full text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                              >
                                ✅ Mark as Paid + Confirmed
                              </button>
                            )}
                            {/* Mark as Shipped */}
                            {['confirmed','processing'].includes(order.status) && (
                              <button
                                onClick={() => updateStatus(order.id, 'shipped', null)}
                                className="w-full text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg transition"
                              >
                                🚚 Mark as Shipped
                              </button>
                            )}
                            {/* Mark as Delivered */}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => updateStatus(order.id, 'delivered', 'paid')}
                                className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition"
                              >
                                📦 Mark as Delivered
                              </button>
                            )}
                            {/* Cancel */}
                            {!['delivered','cancelled','refunded'].includes(order.status) && (
                              <button
                                onClick={() => { if(window.confirm('Cancel this order?')) updateStatus(order.id, 'cancelled', null); }}
                                className="w-full text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition"
                              >
                                ✗ Cancel Order
                              </button>
                            )}
                            {order.notes && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                                <p className="font-semibold mb-0.5">Customer Notes:</p>
                                <p>{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {pages} · {total} orders</p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    p === page ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
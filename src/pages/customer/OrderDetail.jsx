import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheck, FiX, FiDownload } from 'react-icons/fi';
import API from '../../utils/api';

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container py-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" /></div>;
  if (!order)  return <div className="page-container py-12 text-center text-gray-500">Order not found. <Link to="/orders" className="text-orange-500">Back to orders</Link></div>;

  const items       = (order.items || []).filter(Boolean);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const hasPhysical = items.some(i => i.product_type === 'physical');

  return (
    <div className="page-container py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-orange-500 hover:text-orange-600 text-sm">← My Orders</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 text-sm font-medium">{order.order_number}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - main info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Status + tracker */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Order Status</h2>
              <span className={`badge text-sm ${STATUS_COLORS[order.status]}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {!isCancelled && hasPhysical && (
              <div className="relative flex items-center justify-between mt-4">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />
                <div
                  className="absolute left-0 top-4 h-0.5 bg-orange-500 transition-all"
                  style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                />
                {STATUS_STEPS.map((step, i) => {
                  const done = currentStep >= i;
                  return (
                    <div key={step} className="relative flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition ${done ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                        {done ? <FiCheck size={14} /> : <span className="text-xs">{i + 1}</span>}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 capitalize">{step}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {isCancelled && (
              <div className="flex items-center gap-2 text-red-500 mt-2">
                <FiX size={16} /> <span className="text-sm">This order has been {order.status}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <img src={item.product_image || 'https://via.placeholder.com/60'} alt={item.product_name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.product_type === 'digital' && (
                        <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1"><FiDownload size={10} />Digital</span>
                      )}
                      {item.product_type === 'physical' && (
                        <span className="badge bg-blue-100 text-blue-700 flex items-center gap-1"><FiTruck size={10} />Physical</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm flex-shrink-0">₹{Number(item.total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiTruck size={16} className="text-orange-500" />Delivery Address</h2>
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.phone}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right - summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Order</span><span>{order.order_number}</span></div>
              <div className="flex justify-between text-gray-600"><span>Date</span><span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Payment</span><span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'PhonePe'}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Status</span>
                <span className={order.payment_status === 'paid' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{Number(order.shipping_charge) === 0 ? 'FREE' : `₹${order.shipping_charge}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{Number(order.tax).toLocaleString('en-IN')}</span></div>
              {Number(order.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−₹{Number(order.discount).toLocaleString('en-IN')}</span></div>}
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₹{Number(order.total).toLocaleString('en-IN')}</span></div>
            </div>
            <Link to="/products" className="block text-center btn-primary mt-5 text-sm py-2.5">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

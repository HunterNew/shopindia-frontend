import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import API from '../../utils/api';

const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-700',
  confirmed:   'bg-blue-100 text-blue-700',
  processing:  'bg-indigo-100 text-indigo-700',
  shipped:     'bg-cyan-100 text-cyan-700',
  delivered:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
  refunded:    'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container py-12">
      {[1,2,3].map(i => (
        <div key={i} className="card p-5 mb-4 animate-pulse">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-48 mt-3" />
        </div>
      ))}
    </div>
  );

  if (orders.length === 0) return (
    <div className="page-container py-24 text-center">
      <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
      <p className="text-gray-500 mb-6">Your orders will appear here once you make a purchase.</p>
      <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
    </div>
  );

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 flex items-center justify-between hover:shadow-md transition group">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-gray-900 text-sm">{order.order_number}</span>
                <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className={`badge ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{order.items?.filter(Boolean).length || 0} item(s)
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                ₹{Number(order.total).toLocaleString('en-IN')}
                <span className="text-xs text-gray-500 font-normal ml-2">via {order.payment_method === 'cod' ? 'Cash on Delivery' : 'PhonePe'}</span>
              </p>
            </div>
            <FiChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import API from '../../utils/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-xl border border-gray-100" />)}
      </div>
    </div>
  );

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${Number(data.revenue?.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: FiDollarSign, color: 'bg-green-50 text-green-600',
      sub: `${data.revenue?.total_orders || 0} paid orders`
    },
    {
      label: 'Total Orders',
      value: data.orderStats?.reduce((s, o) => s + Number(o.count), 0) || 0,
      icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600',
      sub: `${data.orderStats?.find(o => o.status === 'pending')?.count || 0} pending`
    },
    {
      label: 'Customers',
      value: data.totalCustomers || 0,
      icon: FiUsers, color: 'bg-purple-50 text-purple-600',
      sub: 'Registered users'
    },
    {
      label: 'Products',
      value: data.productStats?.total || 0,
      icon: FiPackage, color: 'bg-orange-50 text-orange-600',
      sub: `${data.productStats?.low_stock || 0} low stock`
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Low stock warning */}
      {Number(data.productStats?.low_stock) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">{data.productStats.low_stock} product(s) are running low on stock</p>
            <p className="text-xs text-yellow-600">Review and restock before items sell out</p>
          </div>
          <Link to="/admin/products" className="text-yellow-700 hover:text-yellow-900 text-sm font-medium flex items-center gap-1">
            View <FiArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-orange-500 text-sm hover:text-orange-600 flex items-center gap-1">View all <FiArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {(data.recentOrders || []).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.customer_name} · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                  <span className={`badge text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
                </div>
              </div>
            ))}
            {!data.recentOrders?.length && <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Top Selling Products</h2>
            <Link to="/admin/products" className="text-orange-500 text-sm hover:text-orange-600 flex items-center gap-1">View all <FiArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {(data.topProducts || []).map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-xs font-bold text-orange-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.units_sold} units sold</p>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{Number(p.revenue).toLocaleString('en-IN')}</p>
              </div>
            ))}
            {!data.topProducts?.length && <p className="text-sm text-gray-400 text-center py-4">No sales yet</p>}
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 mb-5">Orders by Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(data.orderStats || []).map(s => (
            <div key={s.status} className={`rounded-xl p-3 text-center ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-700'}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs capitalize mt-1">{s.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

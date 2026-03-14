import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiShoppingBag, FiTag, FiUsers,
  FiLogOut, FiMenu, FiX, FiGift, FiExternalLink
} from 'react-icons/fi';

const navItems = [
  { to: '/admin',            label: 'Dashboard',   icon: FiGrid,        end: true },
  { to: '/admin/products',   label: 'Products',    icon: FiPackage },
  { to: '/admin/orders',     label: 'Orders',      icon: FiShoppingBag },
  { to: '/admin/categories', label: 'Categories',  icon: FiTag },
  { to: '/admin/users',      label: 'Customers',   icon: FiUsers },
  { to: '/admin/coupons',    label: 'Coupons',     icon: FiGift },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-800 flex-shrink-0">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <div className="text-white font-bold text-sm">ShopIndia</div>
          <div className="text-gray-400 text-xs">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{user?.name}</div>
            <div className="text-gray-400 text-xs">Administrator</div>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg py-1.5 transition">
            <FiExternalLink size={12} /> Store
          </a>
          <button onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-red-400 hover:text-red-300 border border-gray-700 rounded-lg py-1.5 transition">
            <FiLogOut size={12} /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="w-60 bg-gray-900 flex-shrink-0 hidden md:flex flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-gray-900 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 text-gray-500">
            <FiMenu size={22} />
          </button>
          <h1 className="text-gray-800 font-semibold">Admin Panel</h1>
          <div className="ml-auto text-sm text-gray-500">Welcome, {user?.name}</div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

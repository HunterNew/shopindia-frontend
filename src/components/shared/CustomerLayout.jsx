import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiPackage, FiLogOut, FiSettings } from 'react-icons/fi';

export default function CustomerLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [search, setSearch]       = useState('');
  const [dropOpen, setDropOpen]   = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Navbar ── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top bar */}
        {/* <div className="bg-orange-500 text-white text-xs text-center py-1">
          🎉 Free shipping on orders above ₹500 · Use code WELCOME10 for 10% off
        </div> */}

        <div className="page-container">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">ShopIndia</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
              <div className="flex w-full border border-gray-200 rounded-lg overflow-hidden">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 text-sm outline-none"
                />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 transition">
                  <FiSearch size={16} />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition">
                <FiShoppingCart size={22} />
                {cart.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {cart.count > 9 ? '9+' : cart.count}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropOpen(v => !v)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-xs">{user.name[0].toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 top-12 w-48 card shadow-lg py-1 z-50" onMouseLeave={() => setDropOpen(false)}>
                      <Link to="/profile"  onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><FiUser size={14} /> Profile</Link>
                      <Link to="/orders"   onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><FiPackage size={14} /> My Orders</Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-orange-600"><FiSettings size={14} /> Admin Panel</Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={() => { logout(); setDropOpen(false); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4">Login</Link>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 text-gray-600">
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {menuOpen && (
            <div className="pb-3 md:hidden">
              <form onSubmit={handleSearch} className="flex border border-gray-200 rounded-lg overflow-hidden">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 px-4 py-2 text-sm outline-none" />
                <button type="submit" className="bg-orange-500 text-white px-4"><FiSearch size={16} /></button>
              </form>
              <div className="mt-2 flex flex-col gap-1">
                <Link to="/products" onClick={() => setMenuOpen(false)} className="px-2 py-2 text-sm text-gray-700 hover:text-orange-500">All Products</Link>
                {!user && <Link to="/register" onClick={() => setMenuOpen(false)} className="px-2 py-2 text-sm text-gray-700">Register</Link>}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="page-container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-white font-bold text-lg">ShopIndia</span>
              </div>
              <p className="text-sm leading-relaxed">Your one-stop shop for everything you need, delivered fast.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
                <li><Link to="/products?type=digital" className="hover:text-white transition">Digital Goods</Link></li>
                <li><Link to="/products?featured=true" className="hover:text-white transition">Featured</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/orders" className="hover:text-white transition">My Orders</Link></li>
                <li><Link to="/profile" className="hover:text-white transition">Profile</Link></li>
                <li><Link to="/cart" className="hover:text-white transition">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><span>COD Available</span></li>
                <li><span>PhonePe Payments</span></li>
                <li><span>Free returns within 7 days</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            © {new Date().getFullYear()} ShopIndia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

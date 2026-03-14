import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import API from '../../utils/api';
import ProductCard from '../../components/customer/ProductCard';

const features = [
  { icon: FiTruck,      title: 'Free Delivery',   desc: 'On orders above ₹500' },
  { icon: FiShield,     title: 'Secure Payment',  desc: 'PhonePe & COD accepted' },
  { icon: FiRefreshCw,  title: 'Easy Returns',    desc: '7-day hassle-free returns' },
  { icon: FiHeadphones, title: '24/7 Support',    desc: 'Dedicated customer care' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [categories,  setCategories]  = useState([]);
  const [featured,    setFeatured]    = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.slice(0, 6)));
    API.get('/products?featured=true&limit=4').then(r => setFeatured(r.data.products));
    API.get('/products?limit=8&sort=created_at&order=DESC').then(r => setNewArrivals(r.data.products));
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="page-container py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-orange-200 font-medium mb-2">New Arrivals Every Week</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Shop Smarter,<br />Live Better
            </h1>
            <p className="text-orange-100 text-lg mb-8 max-w-md">
              Discover thousands of products — physical & digital — delivered to your doorstep.
            </p>
            {/* Hero search */}
            <form onSubmit={handleSearch} className="flex max-w-md mx-auto md:mx-0">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 px-5 py-3 rounded-l-xl text-gray-800 text-sm outline-none"
              />
              <button type="submit" className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-r-xl font-semibold text-sm transition">
                Search
              </button>
            </form>
          </div>
          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-80 h-80 bg-white/10 rounded-full flex items-center justify-center">
              <div className="text-8xl">🛍️</div>
              <div className="absolute top-8 right-8 bg-white text-gray-800 rounded-xl px-3 py-2 shadow-lg text-xs font-semibold">
                10,000+ Products
              </div>
              <div className="absolute bottom-8 left-8 bg-orange-400 text-white rounded-xl px-3 py-2 shadow-lg text-xs font-semibold">
                Free Shipping 🚚
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Strips ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="page-container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="page-container py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-orange-500 hover:text-orange-600 text-sm flex items-center gap-1 font-medium">
              All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="card hover:shadow-md transition-shadow p-4 text-center group"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-100 transition">
                  <span className="text-2xl">{getCategoryEmoji(cat.slug)}</span>
                </div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-orange-500 transition line-clamp-1">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.product_count} items</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="bg-orange-50 py-12">
          <div className="page-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-500 text-sm">Hand-picked for you</p>
              </div>
              <Link to="/products?featured=true" className="btn-outline text-sm py-2 hidden sm:flex items-center gap-1">
                View All <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section className="page-container py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-500 text-sm">Fresh products added this week</p>
            </div>
            <Link to="/products" className="btn-outline text-sm py-2 hidden sm:flex items-center gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Banner CTA ── */}
      <section className="bg-gray-900 text-white py-14">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-3">Explore Digital Products</h2>
          <p className="text-gray-400 mb-6">E-books, courses, software & more — instant download, no shipping needed.</p>
          <Link to="/products?type=digital" className="btn-primary inline-flex items-center gap-2">
            Browse Digital Store <FiArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function getCategoryEmoji(slug) {
  const map = {
    electronics: '📱', clothing: '👕', 'home-kitchen': '🏠',
    books: '📚', sports: '⚽', 'digital-goods': '💻'
  };
  return map[slug] || '🛍️';
}

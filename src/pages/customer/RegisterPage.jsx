import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join ShopIndia today — it's free</p>
        </div>

        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input type="text" required value={form.name} onChange={set('name')} placeholder="Your full name" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email *</label>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile number" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password *</label>
            <input type="password" required value={form.password} onChange={set('password')} placeholder="Min 6 characters" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password *</label>
            <input type="password" required value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

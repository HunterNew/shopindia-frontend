import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiArrowRight, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';
import { sendOrderViaWhatsApp } from '../../utils/whatsapp';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Jammu and Kashmir','Ladakh','Puducherry'];

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate  = useNavigate();
  const [sent,    setSent]    = useState(false);
  const [notes,   setNotes]   = useState('');
  const [addr,    setAddr]    = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: 'Tamil Nadu', pincode: ''
  });

  const hasPhysical = cart.items.some(i => i.product_type === 'physical');
  const shipping    = hasPhysical ? (cart.subtotal >= 500 ? 0 : 49) : 0;
  const gst         = +(cart.subtotal * 0.18).toFixed(2);
  const total       = +(cart.subtotal + shipping + gst).toFixed(2);

  const set = (k) => (e) => {
    const val = k === 'phone' || k === 'pincode'
      ? e.target.value.replace(/\D/g, '')
      : e.target.value;
    setAddr(a => ({ ...a, [k]: val }));
  };

  const validate = () => {
    if (!addr.full_name.trim()) { toast.error('Please enter your name'); return false; }
    if (!addr.phone.trim() || addr.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number'); return false;
    }
    if (hasPhysical) {
      if (!addr.address_line1.trim()) { toast.error('Please enter your address'); return false; }
      if (!addr.city.trim())          { toast.error('Please enter your city');    return false; }
      if (!addr.pincode || addr.pincode.length !== 6) {
        toast.error('Please enter a valid 6-digit pincode'); return false;
      }
    }
    return true;
  };

  const [saving, setSaving] = useState(false);

  const handleSend = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Step 1 — Save order to database
      await API.post('/orders', {
        shipping_address: hasPhysical ? {
          full_name:     addr.full_name,
          phone:         addr.phone,
          address_line1: addr.address_line1,
          address_line2: addr.address_line2,
          city:          addr.city,
          state:         addr.state,
          pincode:       addr.pincode,
          country:       'India'
        } : null,
        payment_method: 'whatsapp',
        notes: notes || null
      });

      // Step 2 — Open WhatsApp with order details
      sendOrderViaWhatsApp(cart.items, cart.subtotal, addr, notes);

      // Step 3 — Clear cart and show success
      await fetchCart();
      setSent(true);
      toast.success('Order saved and sent to WhatsApp! 🎉');
    } catch (err) {
      // If DB save fails, still open WhatsApp
      console.warn('Order DB save failed:', err.message);
      sendOrderViaWhatsApp(cart.items, cart.subtotal, addr, notes);
      setSent(true);
      toast.success('Order sent to WhatsApp! 🎉');
    } finally {
      setSaving(false);
    }
  };

  if (cart.items.length === 0) { navigate('/cart'); return null; }

  // ── Success state ──────────────────────────────────────────────────────────
  if (sent) return (
    <div className="page-container py-20 text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FiCheck size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Sent! 🎉</h2>
      <p className="text-gray-500 mb-6">
        Your order details have been sent to WhatsApp. We will confirm shortly.
      </p>
      <div className="card p-5 text-left space-y-2 mb-6 text-sm text-gray-600">
        <p>✅ Check WhatsApp for your order message</p>
        <p>✅ We'll confirm within business hours</p>
        <p>✅ Payment can be made via COD / UPI</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setSent(false)}
          className="btn-outline text-sm"
        >
          Edit Order
        </button>
        <button
          onClick={() => { setSent(false); navigate('/products'); }}
          className="btn-primary text-sm"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in your details — we'll send your order directly via WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Left: Form ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Contact Details */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 text-sm font-bold">1</span>
              Your Contact Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  value={addr.full_name}
                  onChange={set('full_name')}
                  placeholder="Your full name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">WhatsApp / Phone *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 rounded-l-lg text-gray-500 text-sm">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={addr.phone}
                    onChange={set('phone')}
                    placeholder="10-digit number"
                    className="input-field rounded-l-none border-l-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {hasPhysical && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 text-sm font-bold">2</span>
                <FiTruck size={16} className="text-orange-500" />
                Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                  <input
                    value={addr.address_line1}
                    onChange={set('address_line1')}
                    placeholder="House no, Street, Area"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Landmark / Address Line 2</label>
                  <input
                    value={addr.address_line2}
                    onChange={set('address_line2')}
                    placeholder="Landmark (optional)"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">City *</label>
                  <input
                    value={addr.city}
                    onChange={set('city')}
                    placeholder="Your city"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Pincode *</label>
                  <input
                    maxLength={6}
                    value={addr.pincode}
                    onChange={set('pincode')}
                    placeholder="6-digit pincode"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">State *</label>
                  <select value={addr.state} onChange={set('state')} className="input-field">
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 text-sm font-bold">
                {hasPhysical ? '3' : '2'}
              </span>
              Special Instructions
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </h2>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special requests, preferred delivery time, etc..."
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* ── Right: Summary + CTA ── */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={item.images?.[0]?.url || 'https://via.placeholder.com/40'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.count} items)</span>
                <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {hasPhysical && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? '🎉 FREE' : `₹${shipping}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{gst}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* WhatsApp CTA Button */}
            <button
              onClick={handleSend}
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              )}
              <span>{saving ? 'Saving order...' : 'Send Order via WhatsApp'}</span>
              {!saving && <FiArrowRight size={18} />}
            </button>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: '🔒', text: 'Secure' },
                { icon: '⚡', text: 'Fast Reply' },
                { icon: '✅', text: 'Verified' },
              ].map(b => (
                <div key={b.text} className="bg-gray-50 rounded-lg py-2 px-1">
                  <div className="text-lg">{b.icon}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{b.text}</div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              We accept COD · UPI · PhonePe · GPay
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
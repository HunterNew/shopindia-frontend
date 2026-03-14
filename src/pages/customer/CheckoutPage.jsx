import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiSmartphone, FiTag, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import { useCart } from '../../context/CartContext';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Jammu and Kashmir','Ladakh','Puducherry'];

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [payMethod, setPayMethod] = useState('cod');
  const [coupon,    setCoupon]    = useState('');
  const [discount,  setDiscount]  = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [placing,   setPlacing]   = useState(false);

  const [addr, setAddr] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: 'Tamil Nadu', pincode: '', country: 'India'
  });

  const hasPhysical = cart.items.some(i => i.product_type === 'physical');
  const shipping    = hasPhysical ? (cart.subtotal >= 500 ? 0 : 49) : 0;
  const gst         = +(cart.subtotal * 0.18).toFixed(2);
  const total       = +(cart.subtotal + shipping + gst - discount).toFixed(2);

  const applyCoupon = async () => {
    try {
      const { data } = await API.post('/orders/validate-coupon', { coupon_code: coupon, subtotal: cart.subtotal });
      setDiscount(data.discount);
      setCouponMsg(`✓ ${data.message} — ₹${data.discount} off`);
    } catch (err) {
      setCouponMsg('✗ ' + (err.response?.data?.error || 'Invalid coupon'));
      setDiscount(0);
    }
  };

  const handleCod = async () => {
    if (hasPhysical && !validateAddr()) return;
    setPlacing(true);
    try {
      const { data } = await API.post('/orders', {
        shipping_address: hasPhysical ? addr : null,
        payment_method: 'cod',
        coupon_code: coupon || undefined
      });
      await fetchCart();
      navigate(`/orders/${data.order.id}`);
      toast.success('Order placed! Pay on delivery 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  const handlePhonePe = async () => {
    if (hasPhysical && !validateAddr()) return;
    setPlacing(true);
    const merchantTxnId = 'TXN' + Date.now();
    try {
      // First create a pending order
      const { data: orderData } = await API.post('/orders', {
        shipping_address: hasPhysical ? addr : null,
        payment_method: 'phonepe',
        phonepe_merchant_txn_id: merchantTxnId,
        coupon_code: coupon || undefined
      });
      // Then initiate PhonePe
      const { data: ppData } = await API.post('/orders/initiate-phonepe', {
        amount: total,
        merchantTransactionId: merchantTxnId
      });
      await fetchCart();
      // Redirect to PhonePe payment page
      const redirectUrl = ppData?.data?.instrumentResponse?.redirectInfo?.url;
      if (redirectUrl) { window.location.href = redirectUrl; }
      else { toast.error('Could not get PhonePe redirect URL'); }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment initiation failed');
    } finally { setPlacing(false); }
  };

  const validateAddr = () => {
    const req = ['full_name','phone','address_line1','city','state','pincode'];
    for (const f of req) {
      if (!addr[f].trim()) { toast.error(`Please fill: ${f.replace('_', ' ')}`); return false; }
    }
    if (!/^\d{6}$/.test(addr.pincode)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    return true;
  };

  const field = (key, label, placeholder, type = 'text', opts = {}) => (
    <div className={opts.half ? '' : 'col-span-2'}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} placeholder={placeholder} value={addr[key]}
        onChange={e => setAddr(a => ({ ...a, [key]: e.target.value }))}
        className="input-field text-sm" required />
    </div>
  );

  if (cart.items.length === 0) {
    navigate('/cart'); return null;
  }

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-3 space-y-6">

          {/* Shipping Address */}
          {hasPhysical && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <FiTruck className="text-orange-500" size={20} /> Delivery Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {field('full_name', 'Full Name *', 'Your full name')}
                {field('phone', 'Phone *', '10-digit mobile number', 'tel', { half: true })}
                {field('address_line1', 'Address Line 1 *', 'House no, Street, Area')}
                {field('address_line2', 'Address Line 2', 'Landmark (optional)')}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                  <input value={addr.city} onChange={e => setAddr(a => ({...a, city: e.target.value}))} placeholder="City" className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label>
                  <input value={addr.pincode} onChange={e => setAddr(a => ({...a, pincode: e.target.value}))} placeholder="6-digit pincode" maxLength={6} className="input-field text-sm" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                  <select value={addr.state} onChange={e => setAddr(a => ({...a, state: e.target.value}))} className="input-field text-sm">
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
              <FiSmartphone className="text-orange-500" size={20} /> Payment Method
            </h2>
            <div className="space-y-3">
              {/* COD */}
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${payMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" value="cod" checked={payMethod === 'cod'} onChange={e => setPayMethod(e.target.value)} className="text-orange-500" />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                </div>
                {payMethod === 'cod' && <FiCheck className="ml-auto text-orange-500" size={18} />}
              </label>

              {/* PhonePe */}
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${payMethod === 'phonepe' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" value="phonepe" checked={payMethod === 'phonepe'} onChange={e => setPayMethod(e.target.value)} />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">PhonePe / UPI</p>
                    <p className="text-xs text-gray-500">Pay securely via PhonePe, BHIM UPI, UPI apps</p>
                  </div>
                </div>
                {payMethod === 'phonepe' && <FiCheck className="ml-auto text-purple-500" size={18} />}
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={item.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1"><FiTag size={12} /> Have a coupon?</label>
              <div className="flex gap-2">
                <input value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponMsg(''); setDiscount(0); }} placeholder="WELCOME10" className="input-field text-sm flex-1" />
                <button onClick={applyCoupon} className="btn-outline text-sm py-2 px-3 whitespace-nowrap">Apply</button>
              </div>
              {couponMsg && <p className={`text-xs mt-1 ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cart.subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{gst}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−₹{discount}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2 mt-2">
                <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={payMethod === 'cod' ? handleCod : handlePhonePe}
              disabled={placing}
              className={`w-full mt-6 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                payMethod === 'phonepe'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {placing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {payMethod === 'cod' ? '✓ Place Order (COD)' : '📱 Pay with PhonePe'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">By placing order you agree to our terms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

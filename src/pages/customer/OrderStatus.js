import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import API from '../../utils/api';

export default function OrderStatus() {
  const [params] = useSearchParams();
  const txn      = params.get('txn');
  const [status,  setStatus]  = useState('loading'); // loading | success | failed
  const [order,   setOrder]   = useState(null);

  useEffect(() => {
    if (!txn) { setStatus('failed'); return; }
    // Poll for order status update (PhonePe callback may take a moment)
    let attempts = 0;
    const poll = async () => {
      try {
        const { data } = await API.get('/orders');
        const match = data.find(o => o.phonepe_merchant_txn_id === txn || o.phonepe_txn_id === txn);
        if (match) {
          setOrder(match);
          setStatus(match.payment_status === 'paid' ? 'success' : 'failed');
        } else if (attempts < 5) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setStatus('failed');
        }
      } catch { setStatus('failed'); }
    };
    poll();
  }, [txn]);

  if (status === 'loading') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <FiLoader size={48} className="text-orange-500 animate-spin mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Confirming your payment…</h2>
      <p className="text-gray-500 text-sm">Please wait, do not close this window.</p>
    </div>
  );

  if (status === 'success') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <FiCheckCircle size={64} className="text-green-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h2>
      <p className="text-gray-500 mb-1">Your order has been confirmed.</p>
      {order && <p className="text-sm text-gray-400 mb-6">Order: <span className="font-semibold text-gray-700">{order.order_number}</span></p>}
      <div className="flex gap-3">
        {order && <Link to={`/orders/${order.id}`} className="btn-primary">View Order</Link>}
        <Link to="/products" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <FiXCircle size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
      <p className="text-gray-500 mb-6">Something went wrong. Your cart is intact — please try again.</p>
      <div className="flex gap-3">
        <Link to="/checkout" className="btn-primary">Try Again</Link>
        <Link to="/orders" className="btn-outline">My Orders</Link>
      </div>
    </div>
  );
}

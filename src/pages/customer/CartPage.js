import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cart.subtotal >= 500 ? 0 : cart.subtotal > 0 ? 49 : 0;
  const gst      = +(cart.subtotal * 0.18).toFixed(2);
  const total    = +(cart.subtotal + shipping + gst).toFixed(2);

  if (cart.items.length === 0) return (
    <div className="page-container py-20 text-center">
      <FiShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started!</p>
      <Link to="/products" className="btn-primary inline-flex items-center gap-2">
        Continue Shopping <FiArrowRight size={16} />
      </Link>
    </div>
  );

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cart.count} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.slug}`}>
                <img src={item.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-semibold text-gray-800 hover:text-orange-500 line-clamp-2 text-sm">{item.name}</Link>
                {item.product_type === 'digital' && <span className="badge bg-purple-100 text-purple-700 mt-1">Digital</span>}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-gray-900">₹{Number(item.price).toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-2">
                    {item.product_type === 'physical' && (
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1.5 hover:bg-gray-50 disabled:opacity-40 rounded-l-lg"><FiMinus size={12} /></button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock_quantity} className="p-1.5 hover:bg-gray-50 disabled:opacity-40 rounded-r-lg"><FiPlus size={12} /></button>
                      </div>
                    )}
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Subtotal: ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.count} items)</span>
                <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-orange-500">Add ₹{(500 - cart.subtotal).toFixed(0)} more for free shipping!</p>
              )}
              <hr />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
              className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <FiArrowRight size={16} />
            </button>
            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-orange-500 mt-3">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

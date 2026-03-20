import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderCartViaWhatsApp } from '../../utils/whatsapp';

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart ({cart.count} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.slug}`}>
                <img
                  src={item.images?.[0]?.url || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-semibold text-gray-800 hover:text-orange-500 line-clamp-2 text-sm">
                  {item.name}
                </Link>
                {item.product_type === 'digital' && (
                  <span className="badge bg-purple-100 text-purple-700 mt-1">Digital</span>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-gray-900">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.product_type === 'physical' && (
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 hover:bg-gray-50 disabled:opacity-40 rounded-l-lg"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          className="p-1.5 hover:bg-gray-50 disabled:opacity-40 rounded-r-lg"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Subtotal: ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
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
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-orange-500">
                  Add ₹{(500 - cart.subtotal).toFixed(0)} more for free shipping!
                </p>
              )}
              <hr />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proceed to Checkout */}
            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
              className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <FiArrowRight size={16} />
            </button>

            {/* Divider */}
            {/* <div className="flex items-center gap-3 my-4">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <hr className="flex-1 border-gray-200" />
            </div> */}

            {/* WhatsApp Order Button */}
            {/* <button
              onClick={() => orderCartViaWhatsApp(cart.items, cart.subtotal)}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order via WhatsApp
            </button> */}

            {/* <p className="text-center text-xs text-gray-400 mt-2">
              Chat with us directly to place your order
            </p> */}

            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-orange-500 mt-3">
              ← Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]       = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], subtotal: 0, count: 0 }); return; }
    try {
      const { data } = await API.get('/cart');
      setCart(data);
    } catch {}
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add to cart'); return false; }
    try {
      await API.post('/cart', { product_id: productId, quantity });
      await fetchCart();
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
      return false;
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await API.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await API.delete(`/cart/${itemId}`);
      await fetchCart();
      toast.success('Removed from cart');
    } catch {}
  };

  const clearCart = async () => {
    try { await API.delete('/cart'); await fetchCart(); } catch {}
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import HomePage           from './pages/customer/HomePage';
import ProductsPage       from './pages/customer/ProductsPage';
import ProductDetail      from './pages/customer/ProductDetail';
import CartPage           from './pages/customer/CartPage';
import CheckoutPage       from './pages/customer/CheckoutPage';
import OrdersPage         from './pages/customer/OrdersPage';
import OrderDetail        from './pages/customer/OrderDetail';
import OrderStatus        from './pages/customer/OrderStatus';
import ProfilePage        from './pages/customer/ProfilePage';
import LoginPage          from './pages/customer/LoginPage';
import RegisterPage       from './pages/customer/RegisterPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';

import AdminDashboard     from './pages/admin/Dashboard';
import AdminProducts      from './pages/admin/Products';
import AdminProductForm   from './pages/admin/ProductForm';
import AdminOrders        from './pages/admin/Orders';
import AdminCategories    from './pages/admin/Categories';
import AdminUsers         from './pages/admin/Users';
import AdminCoupons       from './pages/admin/Coupons';

import CustomerLayout     from './components/shared/CustomerLayout';
import AdminLayout        from './components/shared/AdminLayout';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* ── Customer Routes ── */}
            <Route element={<CustomerLayout />}>
              <Route path="/"                index  element={<HomePage />} />
              <Route path="/products"               element={<ProductsPage />} />
              <Route path="/products/:slug"         element={<ProductDetail />} />
              <Route path="/cart"                   element={<CartPage />} />
              <Route path="/login"                  element={<LoginPage />} />
              <Route path="/register"               element={<RegisterPage />} />
              <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
              <Route path="/order-status"           element={<OrderStatus />} />
              <Route path="/checkout"    element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders"      element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id"  element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>

            {/* ── Admin Routes ── */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index                   element={<AdminDashboard />} />
              <Route path="products"         element={<AdminProducts />} />
              <Route path="products/new"     element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="orders"           element={<AdminOrders />} />
              <Route path="categories"       element={<AdminCategories />} />
              <Route path="users"            element={<AdminUsers />} />
              <Route path="coupons"          element={<AdminCoupons />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
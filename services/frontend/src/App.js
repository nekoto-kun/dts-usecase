import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Layout from './components/Layout';

// Pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import OrderDetail from './pages/OrderDetail';
import OrderList from './pages/OrderList';
import ProductDetail from './pages/ProductDetail';
import ProductManager from './pages/ProductManager';
import SystemStatus from './pages/SystemStatus';

function App() {
  // Simplified logic for cart ID - in a real app, you would use proper session management
  const [cartId, setCartId] = useState(localStorage.getItem('cartId') || null);

  // For a demo app, we can use a fixed user ID
  const userId = 'user123';

  useEffect(() => {
    if (cartId) {
      localStorage.setItem('cartId', cartId);
    }
  }, [cartId]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout cartId={cartId} />}>
          <Route index element={<Home userId={userId} cartId={cartId} setCartId={setCartId} />} />
          <Route path="products/:productId" element={<ProductDetail userId={userId} cartId={cartId} setCartId={setCartId} />} />
          <Route path="manage-products" element={<ProductManager />} />
          <Route path="cart" element={<Cart userId={userId} cartId={cartId} />} />
          <Route path="checkout" element={<Checkout userId={userId} cartId={cartId} setCartId={setCartId} />} />
          <Route path="orders" element={<OrderList userId={userId} />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="system-status" element={<SystemStatus />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
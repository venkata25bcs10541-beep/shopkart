import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';

function App() {
  const [customer, setCustomer] = useState(null);

  return (
    <BrowserRouter>
      {/* CartProvider wraps the entire app so every component shares the same cart state */}
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar customer={customer} setCustomer={setCustomer} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setCustomer={setCustomer} />} />
              <Route path="/home" element={<Home customer={customer} setCustomer={setCustomer} />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

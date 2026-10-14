import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  const [customer, setCustomer] = useState(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar customer={customer} setCustomer={setCustomer} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login setCustomer={setCustomer} />} />
            <Route path="/home" element={<Home customer={customer} setCustomer={setCustomer} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

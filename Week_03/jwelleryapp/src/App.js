import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import ProductDetails from './components/Product_Details/ProductDetails';
import ProductList from './components/shop_sorting/ProductList';
import Home from './components/pages/Home';
import Contact from './components/pages/Contact';

import Login from './components/pages/Login';
import Register from './components/pages/Register';

function App() {
  return (
    <BrowserRouter>

      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<Home />} />

        {/* NEW ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;

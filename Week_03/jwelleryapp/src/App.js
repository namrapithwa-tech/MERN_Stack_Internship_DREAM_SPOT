import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import ProductDetails from "./components/Product_Details/ProductDetails";
import ProductList from "./components/shop_sorting/ProductList";
import Home from "./components/pages/Home";
import Contact from "./components/pages/Contact";

import Login from "./components/pages/Login";
import Register from "./components/pages/Register";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Cart from "./components/cart/cart";
import Checkout from "./components/checkout/Checkout";
import Wishlist from "./components/wishlist/Wishlist";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>

          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<Home />} />

            {/* LOGIN/REGISTER ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Cart & Checkout */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Wishlist */}
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>

          <Footer />

        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { OrderContext } from "../../context/OrderContext";
import { generateInvoicePDF } from "../invoice/invoicePdf";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { itemsCount } = useContext(CartContext);
  const { count } = useContext(WishlistContext);
  const { order } = useContext(OrderContext);

  return (
    <nav className="header-glass navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand brand-logo" to="/">Jwellify</Link>

        <button className="navbar-toggler bg-light" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto gap-4">
            <li><Link className="nav-link" to="/products">Home</Link></li>
            <li><Link className="nav-link" to="/about">About</Link></li>
            <li><Link className="nav-link" to="/products">Products</Link></li>
            <li><Link className="nav-link" to="/contact">Contact</Link></li>
          </ul>

          <div className="d-flex gap-3 align-items-center">

            {/* PRINT INVOICE */}
            {order && (
              <button
                className="print-invoice-btn"
                onClick={() => {
                  const el = document.querySelector(".invoice-wrapper");
                  if (el) generateInvoicePDF(el, order.orderId);
                }}
              >
                <i className="bi bi-printer"></i> Print Invoice
              </button>
            )}

            {/* WISHLIST */}
            <button className="nav-icon-btn position-relative" onClick={() => navigate("/wishlist")}>
              <i className="bi bi-heart"></i>
              <span className="cart-count wish-count">{count()}</span>
            </button>

            {/* CART */}
            <button className="nav-icon-btn position-relative" onClick={() => navigate("/cart")}>
              <i className="bi bi-cart3"></i>
              <span className="cart-count">{itemsCount()}</span>
            </button>

            <Link to="/login" className="nav-icon-btn text-decoration-none">
              <i className="bi bi-person-circle"></i>
              <span className="ms-1">Login</span>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { CartContext } from "../../context/CartContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemsCount } = useContext(CartContext);

  return (
    <nav className="header-glass navbar navbar-expand-lg sticky-top">
      <div className="container">
        {/* LOGO */}
        <Link className="navbar-brand brand-logo" to="/">
          Jwellify
        </Link>

        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto gap-4">
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/products" ? "active" : ""
                }`}
                to="/products"
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname.includes("product") ? "active" : ""
                }`}
                to="/products"
              >
                Products
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact
              </Link>
            </li>
          </ul>

          {/* RIGHT BUTTONS */}
          <div className="d-flex gap-3 align-items-center">
            {/* CART */}
            <button
              className="nav-icon-btn position-relative"
              onClick={() => navigate("/cart")}
              aria-label="Go to cart"
            >
              <i className="bi bi-cart3"></i>
              <span className="cart-count">{itemsCount()}</span>
            </button>

            {/* LOGIN */}
            <Link to="/login" className="nav-icon-btn d-flex align-items-center text-decoration-none">
              <i className="bi bi-person-circle"></i>
              <span className="ms-2">Log in</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

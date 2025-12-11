import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const location = useLocation();

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
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/products">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${location.pathname.includes("product") ? "active" : ""}`} to="/products">Products</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>

          </ul>

          {/* RIGHT BUTTONS */}
          <div className="d-flex gap-3">

            {/* CART */}
            <button className="nav-icon-btn">
              <i className="bi bi-cart3"></i>
            </button>

            {/* LOGIN */}
            <button className="nav-icon-btn">
              <i className="bi bi-person-circle">
              </i> <a href="/login" className="text-reset text-decoration-none">Log in</a>

            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

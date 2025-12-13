import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark api-navbar fixed-top">
      <div className="container">
        
        {/* Left Brand */}
        <Link className="navbar-brand api-brand" to="/">
          API CRUD
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#apiNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Right Links */}
        <div className="collapse navbar-collapse" id="apiNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Products
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/parts">
                Parts
              </NavLink>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

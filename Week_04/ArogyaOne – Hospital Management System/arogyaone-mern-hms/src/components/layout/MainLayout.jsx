import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../layout/style.css';
const MainLayout = ({ children }) => {
  const [isSidebarActive, setSidebarActive] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const navigate = useNavigate();
  const location = useLocation();

  // 3. Use the user data from AuthContext instead of localStorage directly
  const { user, logout } = useContext(AuthContext);

  // User Info
  const userRole = user?.role || 'ADMIN';
  const userName = user?.name || 'Administrator';

  // Live Clock Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Date (dd/mm/yyyy)
  const formattedDate = currentDateTime.toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const formattedTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex">

      {/* SIDEBAR */}
      <nav className={`sidebar ${isSidebarActive ? 'active' : ''}`}>

        {/* LOGO */}
        <div className="sidebar-header">
          <Link to="/" className="logo-brand">
            <i className="fa-solid fa-heart-pulse text-primary"></i>
            <span>ArogyaOne</span>
          </Link>
        </div>

        {/* MENU - NO CATEGORIES */}
        <div className="sidebar-menu">
          {/* ADMIN LINKS */}
          {(userRole === 'ADMIN') && (
            <>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                <i className="fa-solid fa-grid-2"></i> <span>Dashboard</span>
              </Link>
              <Link to="/registration/dashboard" className={`nav-link ${location.pathname === '/registration/dashboard' ? 'active' : ''}`}>
                <i className="fa-solid fa-chart-pie"></i> <span>Overview</span>
              </Link>

              <Link to="/registration/walkin" className={`nav-link ${location.pathname === '/registration/walkin' ? 'active' : ''}`}>
                <i className="fa-solid fa-user-plus"></i> <span>Walk-In Entry</span>
              </Link>

              <Link to="/registration/appointments" className={`nav-link ${location.pathname.includes('/registration/appointments') ? 'active' : ''}`}>
                <i className="fa-solid fa-calendar-check"></i> <span>Appointments</span>
              </Link>

              <Link to="/registration/patients" className={`nav-link ${location.pathname.includes('/registration/patients') ? 'active' : ''}`}>
                <i className="fa-solid fa-hospital-user"></i> <span>All Patients</span>
              </Link>
              <Link to="/department/lab" className="nav-link">
                <i className="fa-solid fa-flask"></i> <span>Laboratory</span>
              </Link>
              <Link to="/department/radiology" className="nav-link">
                <i className="fa-solid fa-x-ray"></i> <span>Radiology</span>
              </Link>
            </>
          )}

          {/* DOCTOR LINKS */}
          {(userRole === 'DOCTOR') && (
            <>
              <Link to="/doctor/ipd" className="nav-link">
                <i className="fa-solid fa-bed-pulse"></i> <span>IPD Rounds</span>
              </Link>
            </>
          )}

          {/* REGISTRATION LINKS */}
          {(userRole === 'REGISTRATION') && (
            <>
              <Link to="/registration" className={`nav-link ${location.pathname === '/registration' ? 'active' : ''}`}>
                <i className="fa-solid fa-gauge"></i> <span>Dashboard</span>
              </Link>

              <Link to="/registration/walkin" className={`nav-link ${location.pathname === '/registration/walkin' ? 'active' : ''}`}>
                <i className="fa-solid fa-person-walking-arrow-right"></i> <span>New Walk-in Patients</span>
              </Link>

              <Link to="/registration/appointments" className={`nav-link ${location.pathname.includes('/registration/appointments') ? 'active' : ''}`}>
                <i className="fa-solid fa-calendar-check"></i> <span>Appointments</span>
              </Link>

              <Link to="/registration/patients" className={`nav-link ${location.pathname.includes('/registration/patients') ? 'active' : ''}`}>
                <i className="fa-solid fa-users"></i> <span>All Patients</span>
              </Link>

              <Link to="/registration/revisit" className={`nav-link ${location.pathname.includes('/registration/revisit') ? 'active' : ''}`}>
                <i className="fa-solid fa-magnifying-glass"></i> <span>Search / Re-Visit</span>
              </Link>

              <Link to="/registration/room-allocation" className={`nav-link ${location.pathname.includes('/registration/room-allocation') ? 'active' : ''}`}>
                <i className="fa-solid fa-bed"></i> <span>Room Allocation</span>
              </Link>

              <Link to="/registration/rooms" className={`nav-link ${location.pathname.includes('/registration/rooms') ? 'active' : ''}`}>
                <i className="fa-solid fa-hospital"></i> <span>Rooms Master</span>
              </Link>
            </>
          )}

          {/* REGISTRATION, BILLING.... ETC ROUTES ADDED HERE */}
        </div>

        {/* RED LOGOUT BUTTON */}
        <div className="sidebar-footer">
          <button className="btn btn-logout" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="main-content">

        {/* HEADER */}
        <header className="top-bar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn border-0 p-0 d-lg-none" onClick={() => setSidebarActive(!isSidebarActive)}>
              <i className="fa-solid fa-bars fs-4 text-dark"></i>
            </button>
            <h5 className="m-0 fw-bold text-dark d-none d-md-block">Hospital Management System</h5>
          </div>

          <div className="d-flex align-items-center gap-4">
            {/* Live Clock */}
            <div className="date-clock-widget d-none d-md-flex">
              <i className="fa-regular fa-calendar"></i>
              <span>{formattedDate}</span>
              <span className="mx-2 text-muted">|</span>
              <i className="fa-regular fa-clock"></i>
              <span>{formattedTime}</span>
            </div>

            {/* Profile */}
            <div className="d-flex align-items-center gap-2 cursor-pointer">
              <div className="text-end d-none d-md-block line-height-1">
                <div className="fw-bold small">{userName}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>{userRole}</div>
              </div>
              <img
                src={`https://ui-avatars.com/api/?name=${userName}&background=009ef7&color=fff`}
                className="rounded-circle shadow-sm"
                width="40"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* PAGES */}
        <div className="p-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
          {children}
        </div>

        {/* COPYRIGHT */}
        <footer className="text-center py-3 bg-white border-top text-muted small">
          &copy; 2026 <strong>ArogyaOne HMS - Designed By : namrapithwa-tech</strong>.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
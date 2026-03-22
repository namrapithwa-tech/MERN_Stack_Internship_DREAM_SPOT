import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../layout/style.css';
import logo from '../../assets/images/logo.png';
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
            <img src={logo} alt="ArogyaOne Logo" className="logo-image w-25 h-25" />
            <div><span className='fw-bolder'>Arogya</span>One</div>
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
              <Link to="/lab" className="nav-link">
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
              <Link to="/doctor" className={`nav-link ${location.pathname === '/doctor' ? 'active' : ''}`}>
                <i className="fa-solid fa-user-doctor"></i> <span>Dashboard</span>
              </Link>

              <Link to="/doctor/opd" className={`nav-link ${location.pathname.includes('/doctor/opd') ? 'active' : ''}`}>
                <i className="fa-solid fa-stethoscope"></i> <span>OPD Consultations</span>
              </Link>

              <Link to="/doctor/ipd" className={`nav-link ${location.pathname.includes('/doctor/ipd') ? 'active' : ''}`}>
                <i className="fa-solid fa-bed-pulse"></i> <span>IPD Rounds</span>
              </Link>

              <Link to="/doctor/appointments" className={`nav-link ${location.pathname.includes('/doctor/appointments') ? 'active' : ''}`}>
                <i className="fa-regular fa-calendar-check"></i> <span>My Appointments</span>
              </Link>

              <Link to="/doctor/patients" className={`nav-link ${location.pathname.includes('/doctor/patients') ? 'active' : ''}`}>
                <i className="fa-solid fa-notes-medical"></i> <span>All Patients</span>
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
                <i className="fa-solid fa-clock-rotate-left"></i> <span>OLD Patient / Re-Visit</span>
              </Link>

              <Link to="/registration/room-allocation" className={`nav-link ${location.pathname.includes('/registration/room-allocation') ? 'active' : ''}`}>
                <i className="fa-solid fa-bed"></i> <span>Room Allocation</span>
              </Link>
            </>
          )}

          {/* LAB MASTER */}
          {/* --- LAB DEPARTMENT MENU --- */}
          {(userRole === 'LAB') && (
            <>
              <Link to="/lab" className={`nav-link ${location.pathname === '/lab' ? 'active' : ''}`}>
                <i className="fa-solid fa-gauge"></i> <span>Dashboard</span>
              </Link>

              <Link to="/lab/master" className={`nav-link ${location.pathname.includes('/lab/master') ? 'active' : ''}`}>
                <i className="fa-solid fa-tags"></i> <span>Test Master Pricing</span>
              </Link>

              <Link to="/lab/requests" className={`nav-link ${location.pathname.includes('/lab/requests') ? 'active' : ''}`}>
                <i className="fa-solid fa-vials"></i> <span>Pending Requests</span>
              </Link>

              {/* NEW ACTIVE ORDERS LINK */}
              <Link to="/lab/active" className={`nav-link ${location.pathname.includes('/lab/active') ? 'active' : ''}`}>
                <i className="fa-solid fa-microscope"></i> <span>Active Orders</span>
              </Link>

              <Link to="/lab/reports" className={`nav-link ${location.pathname.includes('/lab/reports') ? 'active' : ''}`}>
                <i className="fa-solid fa-file-prescription"></i> <span>Completed Reports</span>
              </Link>
            </>
          )}

          {/* --- SURGERY / OT LINKS --- */}
          {(userRole === 'SURGERY') && (
            <>
              <Link to="/surgery" className={`nav-link ${location.pathname === '/surgery' ? 'active' : ''}`}>
                <i className="fa-solid fa-gauge"></i> <span>OT Dashboard</span>
              </Link>

              <Link to="/surgery/schedule" className={`nav-link ${location.pathname.includes('/surgery/schedule') ? 'active' : ''}`}>
                <i className="fa-solid fa-calendar-plus"></i> <span>OT Scheduling</span>
              </Link>

              <Link to="/surgery/logs" className={`nav-link ${location.pathname.includes('/surgery/logs') ? 'active' : ''}`}>
                <i className="fa-solid fa-file-medical"></i> <span>Surgery Logs</span>
              </Link>
            </>
          )}

          {/* --- CENTRAL BILLING LINKS --- */}
          {(userRole === 'BILLING') && (
            <>
              <Link to="/billing" className={`nav-link ${location.pathname === '/billing' ? 'active' : ''}`}>
                <i className="fa-solid fa-chart-line"></i> <span>Revenue Dashboard</span>
              </Link>

              <Link to="/billing/ipd" className={`nav-link ${location.pathname.includes('/billing/ipd') ? 'active' : ''}`}>
                <i className="fa-solid fa-file-invoice-dollar"></i> <span>IPD Final Billing</span>
              </Link>

            </>
          )}
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
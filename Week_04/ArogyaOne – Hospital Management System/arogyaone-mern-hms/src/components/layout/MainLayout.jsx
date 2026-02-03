import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../assets/css/style.css'; // Importing your custom design

const MainLayout = ({ children }) => {
  const [isSidebarActive, setSidebarActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get User Role from localStorage (Assuming you stored it during Login)
  // Or you can use your AuthContext here: const { user } = useAuth();
  const userRole = localStorage.getItem('role') || 'GUEST'; 
  const userName = localStorage.getItem('userName') || 'User';

  const toggleSidebar = () => setSidebarActive(!isSidebarActive);
  const handleLogout = () => {
      localStorage.clear();
      navigate('/login');
  };

  return (
    <div className="d-flex">
      {/* --- SIDEBAR --- */}
      <nav className={`sidebar ${isSidebarActive ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-text"><i className="fa-solid fa-heart-pulse"></i> ArogyaOne</div>
          <small className="opacity-75">HMS Dashboard</small>
        </div>

        <div className="sidebar-menu">
          <ul className="nav flex-column">
            
            {/* COMMON LINKS */}
            <li className="nav-item">
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                <i className="fa-solid fa-house"></i> Home
              </Link>
            </li>

            {/* --- REGISTRATION MODULE --- */}
            {/* We check role to show specific menus */}
            {(userRole === 'REGISTRATION' || userRole === 'ADMIN') && (
                <>
                <div className="text-muted small px-4 mt-3 mb-1 fw-bold">FRONT DESK</div>
                <li className="nav-item">
                    <Link to="/registration/dashboard" className={`nav-link ${location.pathname.includes('registration') ? 'active' : ''}`}>
                        <i className="fa-solid fa-desktop"></i> Dashboard
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/registration/new-patient" className="nav-link">
                        <i className="fa-solid fa-user-plus"></i> New Patient
                    </Link>
                </li>
                </>
            )}

            {/* --- DOCTOR MODULE (Future) --- */}
            {userRole === 'DOCTOR' && (
                 <li className="nav-item">
                    <Link to="/doctor/dashboard" className="nav-link">
                        <i className="fa-solid fa-user-doctor"></i> My Queue
                    </Link>
                </li>
            )}
            
            
          </ul>
        </div>

        <div className="sidebar-footer">
          <button className="btn btn-logout" onClick={handleLogout}>
            <i className="fa-solid fa-power-off me-2"></i> Logout
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content w-100">
        
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-bars mobile-toggle d-lg-none me-3 fs-4" onClick={toggleSidebar}></i>
            <div>
                <h5 className="m-0 text-dark fw-bold">Welcome, {userName}</h5>
                <small className="text-muted">{userRole} ACCESS</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
             <div className="live-clock d-none d-md-block bg-light px-3 py-1 rounded-pill text-primary fw-bold small">
                <i className="fa-regular fa-clock me-2"></i> {new Date().toLocaleDateString()}
             </div>
             <img src={`https://ui-avatars.com/api/?name=${userName}&background=007bff&color=fff`} className="rounded-circle border border-2 border-white shadow-sm" width="40" alt="User" />
          </div>
        </div>

        {/* CONTENT INJECTION */}
        <div className="page-content">
            {children} 
        </div>

        {/* FOOTER */}
        <footer className="footer mt-auto text-center py-3 text-muted small">
            <p className="mb-0">&copy; 2026 <strong>ArogyaOne HMS</strong>. Darshan University.</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
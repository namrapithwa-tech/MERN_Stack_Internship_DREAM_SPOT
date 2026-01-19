import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const res = await api.get(
      `/users?email=${email}&password=${password}`
    );

    if (res.data.length === 0) {
      alert("Invalid Email or Password");
      return;
    }

    const user = res.data[0];
    login(user);

    switch (user.role) {
      case "ADMIN":
        navigate("/admin");
        break;
      case "REGISTRATION":
        navigate("/registration");
        break;
      case "DOCTOR":
        navigate("/doctor");
        break;
      case "NURSE":
        navigate("/nurse");
        break;
      case "BILLING":
        navigate("/billing");
        break;
      case "PATIENT":
        navigate("/patient");
        break;
      case "LAB":
        navigate("/department/lab");
        break;
      case "ECG":
        navigate("/department/ecg");
        break;
      case "RADIOLOGY":
        navigate("/department/radiology");
        break;
      case "MRI":
        navigate("/department/mri");
        break;
      case "SURGERY":
        navigate("/department/surgery");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <>
      {/* Inline CSS from the original HTML */}
      <style>
        {`
          :root {
            --primary-green: #00e676;
            --mint-green: #e8f5e9;
            --text-dark: #1a2b20;
            --text-muted: #6c757d;
          }
          body {
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
            overflow-x: hidden;
          }
          .login-wrapper {
            min-height: 100vh;
          }
          .branding-column {
            background-color: var(--mint-green);
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
          }
          .abstract-shape {
            position: absolute;
            background: rgba(0, 230, 118, 0.1);
            border-radius: 50%;
          }
          .shape-1 {
            width: 400px;
            height: 400px;
            top: -100px;
            left: -100px;
          }
          .shape-2 {
            width: 300px;
            height: 300px;
            bottom: -50px;
            right: -50px;
          }
          .branding-content {
            position: relative;
            z-index: 2;
            max-width: 480px;
          }
          .brand-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 2rem;
          }
          .logo-icon {
            background-color: var(--primary-green);
            width: 42px;
            height: 42px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }
          .feature-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .form-column {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            background-color: #ffffff;
          }
          .login-card {
            width: 100%;
            max-width: 420px;
          }
          .form-label {
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
          }
          .input-group-custom {
            position: relative;
          }
          .input-group-custom .form-control {
            padding: 0.8rem 1rem 0.8rem 2.8rem;
            border-radius: 12px;
            border: 1px solid #e0e0e0;
            background-color: #fcfcfc;
          }
          .input-group-custom .form-control:focus {
            box-shadow: 0 0 0 4px rgba(0, 230, 118, 0.1);
            border-color: var(--primary-green);
          }
          .input-group-custom .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 20px;
            z-index: 5;
          }
          .password-toggle {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: none;
            color: var(--text-muted);
            cursor: pointer;
            z-index: 5;
            padding: 0;
            display: flex;
            align-items: center;
          }
          .btn-signin {
            background-color: var(--primary-green);
            border: none;
            color: #000;
            font-weight: 700;
            padding: 1rem;
            border-radius: 12px;
            width: 100%;
            margin-top: 1.5rem;
            transition: all 0.2s ease;
          }
          .btn-signin:hover {
            background-color: #00c868;
            transform: translateY(-1px);
          }
          .footer-buttons .btn-outline-secondary {
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            border-color: #e0e0e0;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .footer-buttons .btn-outline-secondary:hover {
            background-color: #f8f9fa;
            border-color: #d0d0d0;
            color: var(--text-dark);
          }
          .text-primary-green {
            color: #00c868 !important;
          }
        `}
      </style>

      {/* Main HTML Structure Converted to JSX */}
      <div className="container-fluid p-0">
        <div className="row g-0 login-wrapper">
          {/* Branding Column */}
          <div className="col-lg-7 branding-column d-none d-lg-flex">
            <div className="abstract-shape shape-1"></div>
            <div className="abstract-shape shape-2"></div>
            <div className="branding-content">
              <div className="brand-logo">
                <div className="logo-icon">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <h2 className="mb-0 fw-bold">ArogyaOne</h2>
              </div>
              <h1 className="display-5 fw-bold mb-4">
                The future of <span className="text-primary-green">clinical care</span> starts here.
              </h1>
              <p className="lead text-muted mb-5">
                Manage patient records, staff scheduling, and facility logistics with our high-performance administrative engine.
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="feature-card">
                    <span className="material-symbols-outlined text-primary-green mb-3">verified_user</span>
                    <h6 className="fw-bold">Enterprise Grade</h6>
                    <p className="small text-muted mb-0">Full HIPAA compliance and end-to-end data encryption.</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="feature-card">
                    <span className="material-symbols-outlined text-primary-green mb-3">speed</span>
                    <h6 className="fw-bold">Real-time Sync</h6>
                    <p className="small text-muted mb-0">Instant updates across all clinical departments.</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-muted small">
                <span>© 2024 ArogyaOne Systems</span>
                <span className="mx-2">•</span>
                <span>v4.2.0-stable</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="col-lg-5 col-12 form-column">
            <div className="login-card">
              <div className="text-center text-lg-start mb-5">
                <h3 className="fw-bold mb-2">Welcome Back</h3>
                <p className="text-muted">Enter your credentials to access the admin portal.</p>
              </div>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="form-label">Email Address</label>
                  <div className="input-group-custom">
                    <span className="material-symbols-outlined input-icon">mail</span>
                    <input
                      className="form-control"
                      placeholder="name@arogyaone.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label">Password</label>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a className="small text-decoration-none text-primary-green fw-bold" href="#">
                      Forgot?
                    </a>
                  </div>
                  <div className="input-group-custom">
                    <span className="material-symbols-outlined input-icon">lock</span>
                    <input
                      className="form-control"
                      placeholder="••••••••"
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="password-toggle" type="button">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </div>
                <div className="form-check mb-4">
                  <input className="form-check-input" id="rememberMe" type="checkbox" />
                  <label className="form-check-label small text-muted" htmlFor="rememberMe">
                    Keep me signed in
                  </label>
                </div>
                <button className="btn btn-signin" type="submit">
                  Sign In
                </button>
              </form>
              <div className="mt-5 pt-4 border-top">
                <p className="small text-center text-muted mb-3">Having trouble signing in?</p>
                <div className="d-flex gap-2 justify-content-center footer-buttons">
                  <button className="btn btn-outline-secondary">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      contact_support
                    </span>
                    Contact Support
                  </button>
                  <button className="btn btn-outline-secondary">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      analytics
                    </span>
                    System Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
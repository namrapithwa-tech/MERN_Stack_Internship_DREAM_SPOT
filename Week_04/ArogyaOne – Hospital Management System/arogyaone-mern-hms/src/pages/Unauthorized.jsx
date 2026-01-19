import React from 'react';
import { Link } from 'react-router-dom'; // Assuming React Router is installed for navigation

const Unauthorized = () => {
  return (
    <>
      {/* Embedded styles to match the original HTML */}
      <style>
        {`
          :root {
            --primary: #29a847;
            --primary-light: rgba(41, 168, 71, 0.1);
            --primary-hover: #238f3d;
            --bg-light: #f6f8f6;
            --text-main: #111827;
            --text-muted: #4b5563;
            --border-color: #e5e7eb;
            --white: #ffffff;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Public Sans', sans-serif;
            background-color: var(--bg-light);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          /* Header */
          header {
            background-color: var(--white);
            border-bottom: 1px solid var(--border-color);
            width: 100%;
          }

          .header-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1.5rem;
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .logo-group {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .logo-icon {
            width: 2rem;
            height: 2rem;
            color: var(--primary);
          }

          /* Main Content */
          main {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
          }

          .card {
            max-width: 28rem;
            width: 100%;
            background-color: var(--white);
            border-radius: 0.75rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            padding: 3rem;
            text-align: center;
          }

          /* Icon Animation */
          .icon-container {
            position: relative;
            margin: 0 auto 2rem;
            width: 6rem;
            height: 6rem;
          }

          .pulse-bg {
            position: absolute;
            inset: 0;
            background-color: var(--primary-light);
            border-radius: 9999px;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .lock-icon-bg {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background-color: rgba(41, 168, 71, 0.2);
            border-radius: 9999px;
            color: var(--primary);
          }

          /* Buttons */
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.875rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
          }

          .btn-primary {
            background-color: var(--primary);
            color: white;
            box-shadow: 0 4px 6px -1px rgba(41, 168, 71, 0.2);
          }

          .btn-primary:hover {
            opacity: 0.9;
          }

          .btn-ghost {
            background: transparent;
            color: var(--text-muted);
            font-weight: 500;
          }

          .btn-ghost:hover {
            background-color: rgba(0,0,0,0.05);
          }

          /* Footer Links (styled as buttons to resemble links) */
          .footer-links button {
            color: var(--text-muted);
            font-size: 0.875rem;
            text-decoration: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            margin: 0;
          }

          .footer-links button:hover {
            color: var(--primary);
          }

          /* Utilities */
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }

          .divider {
            height: 4px;
            width: 3rem;
            background-color: var(--primary);
            margin: 1rem auto;
            border-radius: 9999px;
          }

          footer {
            padding: 2rem 1.5rem;
            background-color: var(--white);
            border-top: 1px solid var(--border-color);
            text-align: center;
          }

          .footer-links {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem 3rem;
            margin-bottom: 1.5rem;
          }
        `}
      </style>

      {/* Note: Header is missing in your provided code snippet. If you need it, add it back from the original HTML conversion. For now, starting with main. */}

      <main>
        <div className="card">
          <div className="icon-container">
            <div className="pulse-bg"></div>
            <div className="lock-icon-bg">
              <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>lock</span>
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>ArogyaOne HMS</h2>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>403 - Unauthorized</h2>
            <div className="divider"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: 1.6 }}>
              You do not have permission to access this page.
              <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.75 }}>
                Please contact your system administrator if you believe this is an error.
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
            <Link to="/" className="btn btn-ghost">Back to Dashboard</Link>
          </div>
        </div>
      </main>

      <footer>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          © 2026 ArogyaOne Hospital Management System. All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default Unauthorized;
import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="auth-page">

      <div className="glass auth-box p-4">
        <h2 className="auth-title text-center">Login</h2>

        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input type="email" className="input-box" placeholder="Email Address" required />
            <input type="password" className="input-box" placeholder="Password" required />

            <button className="auth-btn mt-2">Login</button>

            <p className="text-center mt-3">
              Don’t have an account?
              <a href="/register" className="auth-link"> Register</a>
            </p>
          </form>
        ) : (
          <p className="success-msg">Login Successful! Redirecting...</p>
        )}
      </div>

    </div>
  );
};

export default Login;

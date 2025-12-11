import React, { useState } from "react";
import "./Register.css";

const Register = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="auth-page">

      <div className="glass auth-box p-4">
        <h2 className="auth-title text-center">Create Account</h2>

        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input type="text" className="input-box" placeholder="Full Name" required />
            <input type="email" className="input-box" placeholder="Email Address" required />
            <input type="password" className="input-box" placeholder="Password" required />
            <input type="password" className="input-box" placeholder="Confirm Password" required />

            <button className="auth-btn mt-2">Register</button>

            <p className="text-center mt-3">
              Already have an account?
              <a href="/login" className="auth-link"> Login</a>
            </p>
          </form>
        ) : (
          <p className="success-msg">Your account has been created successfully!</p>
        )}
      </div>

    </div>
  );
};

export default Register;

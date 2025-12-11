import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="contact-page container">

      <h1 className="contact-title text-center mt-4">Contact Us</h1>

      {/* OFFICE DETAILS */}
      <div className="row mt-5">

        {/* HEAD OFFICE */}
        <div className="col-md-6">
          <div className="glass office-box p-4">
            <h3 className="office-title">Head Office</h3>
            <p>Jwellify Pvt. Ltd.</p>
            <p>Rajkot, Gujarat – 36004</p>
            <p><b>Call:</b> +91 91733 16294</p>
            <p><b>Email:</b> info@jwellify.com</p>
          </div>
        </div>

        {/* BRANCH */}
        <div className="col-md-6">
          <div className="glass office-box p-4">
            <h3 className="office-title">Branch Office</h3>
            <p>Jwellify India</p>
            <p>Ahmedabad, Gujarat – 380015</p>
            <p><b>Call:</b> +91 91234 56780</p>
            <p><b>Email:</b> branch.ahemdabad@jwellify.com</p>
          </div>
        </div>

        <div className="col-md-6 mt-3">
          <div className="glass office-box p-4">
            <h3 className="office-title">Branch Office</h3>
            <p>Jwellify India</p>
            <p>Surat, Gujarat – 380015</p>
            <p><b>Call:</b> +91 91733 16295</p>
            <p><b>Email:</b> branch.surat@jwellify.com</p>
          </div>
        </div>

        <div className="col-md-6 mt-3">
          <div className="glass office-box p-4">
            <h3 className="office-title">Branch Office</h3>
            <p>Jwellify India</p>
            <p>Vadodra, Gujarat – 380015</p>
            <p><b>Call:</b> +91 91733 16296</p>
            <p><b>Email:</b> branch.vadodra@jwellify.com</p>
          </div>
        </div>
      </div>

      {/* TOLL FREE */}
      <div className="tollfree text-center mt-4">
        <h4>Toll Free: <span>1800-123-456</span></h4>
      </div>

      {/* CONTACT FORM */}
      <div className="glass contact-form p-4 mt-4 mb-5">
        <h3>Send Us an Inquiry</h3>

        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input type="text" className="input-box" placeholder="Your Name" required />
            <input type="email" className="input-box" placeholder="Your Email" required />
            <input type="text" className="input-box" placeholder="Subject" required />
            <textarea className="input-box" rows="4" placeholder="Message" required></textarea>

            <button className="send-btn">Submit Inquiry</button>
          </form>
        ) : (
          <p className="success-msg">Our Representative will reach you soon!</p>
        )}
      </div>
    </div>
  );
};

export default Contact;

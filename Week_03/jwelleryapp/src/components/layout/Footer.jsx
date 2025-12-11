import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
    const [showTop, setShowTop] = useState(false);

    // show scroll-to-top button
    useEffect(() => {
        const checkScroll = () => {
            if (window.scrollY > 250) setShowTop(true);
            else setShowTop(false);
        };
        window.addEventListener("scroll", checkScroll);
        return () => window.removeEventListener("scroll", checkScroll);
    }, []);

    // scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="footer-dark">
            <div className="container py-5">

                <div className="row text-center text-md-start">

                    {/* LOGO + ABOUT */}
                    <div className="col-md-3 mb-4">
                        <h3 className="footer-logo gold-underline">Jwellify</h3>
                        <p className="footer-desc">
                            Crafting luxury ornaments with elegance, purity & perfection.
                        </p>

                        {/* SOCIAL ICONS */}
                        <div className="footer-social mt-3">
                            <a href="#" className="social-icon"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="social-icon"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="social-icon"><i className="bi bi-linkedin"></i></a>
                        </div>
                    </div>

                    {/* SITEMAP */}
                    <div className="col-md-3 mb-4">
                        <h5 className="footer-title gold-underline">Sitemap</h5>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* CONTACT INFO */}
                    <div className="col-md-3 mb-4">
                        <h5 className="footer-title gold-underline">Contact Us</h5>

                        <p className="footer-info">
                            <i className="bi bi-telephone-fill"></i>
                            Toll Free: <a href="tel:1800123456">1800-123-456</a>
                        </p>

                        <p className="footer-info">
                            <i className="bi bi-envelope-fill"></i>
                            <a href="mailto:support@jwellify.com">support@jwellify.com</a>
                        </p>

                        <p className="footer-info">
                            <i className="bi bi-geo-alt-fill"></i>
                            Jwellify Pvt. Ltd.<br />
                            Rajkot, Gujarat – 36004
                        </p>

                        <p className="footer-info">
                            <i className="bi bi-phone-fill"></i>
                            +91 91733 16294
                        </p>
                    </div>

                    {/* NEWSLETTER */}
                    <div className="col-md-3 mb-4">
                        <h5 className="footer-title gold-underline">Newsletter</h5>
                        <p className="footer-desc mb-2">
                            Subscribe to get updates & offers.
                        </p>

                        <div className="newsletter-box">
                            <input type="text" placeholder="Enter your email" />
                            <button><i className="bi bi-send"></i></button>
                        </div>

                        <h6 className="footer-title mt-4">Secured By</h6>
                        <img
                            src="/assets/media/onboarding.png"
                            alt="secure"
                            className="secure-logo"
                        />
                    </div>

                </div>

                <hr className="footer-line" />

                <p className="footer-copy text-center">
                    © {new Date().getFullYear()} Jwellify (Namra Pithwa)– All Rights Reserved.
                </p>

                {/* SCROLL TO TOP BUTTON */}
                {showTop && (
                    <button className="scroll-top-btn" onClick={scrollToTop}>
                        <i className="bi bi-arrow-up"></i>
                    </button>
                )}

            </div>
        </footer>
    );
};

export default Footer;

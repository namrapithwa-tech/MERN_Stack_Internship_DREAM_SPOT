import React from "react";
import "./Footer.css";
// import secqure from "../public/assets/media/onboarding.png";
// import secqure from "../../../public/assets/media/onboarding.png";




const Footer = () => {
    return (
        <footer className="footer-dark mt-5">
            <div className="container py-5">

                <div className="row text-center text-md-start">

                    {/* LOGO */}
                    <div className="col-md-4 mb-3">
                        <h3 className="footer-logo">Jwellify</h3>
                    </div>

                    {/* SITEMAP */}
                    <div className="col-md-4 mb-3">
                        <h5 className="footer-title">Sitemap</h5>
                        <ul className="footer-links">
                            <li>Home</li>
                            <li>About</li>
                            <li>Products</li>
                            <li>Contact</li>
                        </ul>
                    </div>

                    {/* SECURED BY */}
                    <div className="col-md-4 mb-3">
                        <h5 className="footer-title">Secured By</h5>
                        <img src="/assets/media/onboarding.png" alt="secure" width="50px"/>

                    </div>

                </div>

                <hr className="footer-line" />

                <p className="footer-copy text-center">
                    © Namra Pithwa – 2025. All Rights Reserved.
                </p>

            </div>
        </footer>
    );
};

export default Footer;

import React from "react";
import "./Home.css";
import founder from "./founder.png";

const Home = () => {
  return (
    <div className="home-page">

      {/* ABOUT COMPANY SECTION */}
      <section className="container about-section">
        <div className="row align-items-center glass p-4">
          
          {/* HQ IMAGE */}
          <div className="col-md-6 text-center">
            <img 
              src="https://cdn.prod.website-files.com/66a08e07fa6352714fc1d6da/6738a643bc3d5351e6afdefc_66f561ae967a176001607ba4_66a0ae0c47e05300062d7a41_dfl_epitome.jpeg"
              alt="Rajkot Headquarter"
              className="hq-img"
            />
          </div>

          {/* ABOUT TEXT */}
          <div className="col-md-6">
            <h2 className="section-title">About Our Company</h2>
            <p className="about-text">
              Jwellify was established in 2020 with a vision to create 
              world-class jewellery with premium craftsmanship. Headquartered in 
              Rajkot, we focus on blending modern luxury with traditional artistry.
            </p>

            <p className="about-text">
              Over the years, we have grown into a trusted jewellery brand by 
              delivering quality, innovation, and authenticity. Our mission is 
              to redefine elegance through ethically sourced diamonds, premium 
              metals, and precision engineering.
            </p>

            <p className="about-text">
              With an expanding network and a strong digital presence, we continue 
              our journey to make luxury jewellery accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="container mt-5">
        <h2 className="section-title text-center mb-4">Founder & Managing Director</h2>

        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="glass founder-card text-center p-4">
              <img
                src={founder}
                alt="Founder"
                className="founder-img"
              />
              <h3 className="founder-name">Namra Pithwa</h3>
              <p className="founder-role">Founder & MD</p>
              <p className="founder-desc">
                A visionary entrepreneur building a global luxury jewellery brand 
                with passion, innovation, and commitment to excellence.
              </p>
            </div>
          </div>
        </div>

        
      </section>

      {/* TIMELINE SECTION */}
      <section className="container mt-5 timeline-wrapper">
        <h2 className="section-title text-center mb-5">Our Journey (2020–2025)</h2>

        <div className="timeline">

          <div className="timeline-item left">
            <div className="timeline-content glass">
              <h4>2020</h4>
              <p>Company founded in Rajkot with a small team of skilled artisans.</p>
            </div>
          </div>

          <div className="timeline-item right">
            <div className="timeline-content glass">
              <h4>2021</h4>
              <p>Launched India’s most modern online jewellery experience.</p>
            </div>
          </div>

          <div className="timeline-item left">
            <div className="timeline-content glass">
              <h4>2022</h4>
              <p>Crossed 10,000+ loyal premium customers internationally.</p>
            </div>
          </div>

          <div className="timeline-item right">
            <div className="timeline-content glass">
              <h4>2023</h4>
              <p>Established large-scale manufacturing & design innovation labs.</p>
            </div>
          </div>

          <div className="timeline-item left">
            <div className="timeline-content glass">
              <h4>2024</h4>
              <p>Integrated AI-based jewellery customization for global customers.</p>
            </div>
          </div>

          <div className="timeline-item right">
            <div className="timeline-content glass">
              <h4>2025</h4>
              <p>Became one of India’s fastest growing luxury jewellery brands.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;

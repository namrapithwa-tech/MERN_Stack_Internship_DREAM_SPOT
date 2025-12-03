import './myportfolio.css';
import myportfolio_animation from './myportfolio_animation';
import { useEffect } from 'react';
import portimg1 from '../assets/media/myportfolio_images/portfolio-01.jpg';
import portimg2 from '../assets/media/myportfolio_images/portfolio-02.jpg';
import portimg3 from '../assets/media/myportfolio_images/portfolio-03.jpg';
import portimg4 from '../assets/media/myportfolio_images/portfolio-04.jpg';
import portimg5 from '../assets/media/myportfolio_images/portfolio-05.jpg';
import portimg6 from '../assets/media/myportfolio_images/portfolio-06.jpg';


const MyPortfolio = () => {

    useEffect(() => {
        myportfolio_animation();
    }, []);

    return (
        <>
            <div class="container py-5">

                <h3 class="section-subtitle text-uppercase">Portfolio</h3>
                <h1 class="section-title mb-5">My Creative Works</h1>

                <div class="row g-4">

                    {/* <!-- CARD 1 --> */}
                    <div class="col-md-4">
                        <div class="portfolio-card">
                            <div class="portfolio-img">
                                <img src={portimg1} class="img-fluid"/>
                            </div>

                            <div class="portfolio-content">
                                <p class="card-type">Design</p>
                                <h4 class="card-title">Modern UI Dashboard</h4>

                                <div class="arrow-box">
                                    <span class="arrow">→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- CARD 2 --> */}
                    <div class="col-md-4">
                        <div class="portfolio-card">
                            <div class="portfolio-img">
                                <img src={portimg2} class="img-fluid"/>
                            </div>

                            <div class="portfolio-content">
                                <p class="card-type">Development</p>
                                <h4 class="card-title">Mobile App Interface</h4>

                                <div class="arrow-box">
                                    <span class="arrow">→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- CARD 3 --> */}
                    <div class="col-md-4">
                        <div class="portfolio-card">
                            <div class="portfolio-img">
                                <img src={portimg3} class="img-fluid"/>
                            </div>

                            <div class="portfolio-content">
                                <p class="card-type">Branding</p>
                                <h4 class="card-title">Creative Logo Design</h4>

                                <div class="arrow-box">
                                    <span class="arrow">→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    {/* <!-- CARD 4 --> */}
                    <div class="col-md-4">
                        <div class="portfolio-card">
                            <div class="portfolio-img">
                                <img src={portimg4} class="img-fluid"/>
                            </div>

                            <div class="portfolio-content">
                                <p class="card-type">Figma</p>
                                <h4 class="card-title">Mobile app landing design & Sercvices</h4>

                                <div class="arrow-box">
                                    <span class="arrow">→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- CARD 5 --> */}
                    <div class="col-md-4">
                        <div class="portfolio-card">
                            <div class="portfolio-img">
                                <img src={portimg5} class="img-fluid"/>
                            </div>

                            <div class="portfolio-content">
                                <p class="card-type">Web Design</p>
                                <h4 class="card-title">Design for Technology and Sercvices</h4>

                                <div class="arrow-box">
                                    <span class="arrow">→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- CARD 6 --> */}
                    <div class="col-md-4">
                        <div class="portfolio-card">
                            <div class="portfolio-img">
                                <img src={portimg6} class="img-fluid"/>
                            </div>

                            <div class="portfolio-content">
                                <p class="card-type">App Devlopment</p>
                                <h4 class="card-title">Design for Technology and Sercvices</h4>

                                <div class="arrow-box">
                                    <span class="arrow">→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <hr className="hr-1"></hr>
        </>
    );
};

export default MyPortfolio;
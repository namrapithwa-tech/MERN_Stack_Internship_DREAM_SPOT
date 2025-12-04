import './testimonials.css';
import personImg1 from '../assets/media/testimonial_section/person1.png';
import personImg2 from '../assets/media/testimonial_section/person2.png';
import personImg3 from '../assets/media/testimonial_section/person3.png';
import personImg4 from '../assets/media/testimonial_section/person4.png';
import personImg5 from '../assets/media/testimonial_section/person5.png';

const Testimonials = () => {
    return (
        <>
            <section className="testimonial-area" id="testimonial">
                <div className="container">

                    {/* <!-- HEADER --> */}
                    <div className="row mb-5">
                        <div className="col-12 text-center">
                            <div className="section-heading">
                                <h4>WHAT CLIENTS SAY</h4>
                                <h1>Testimonial</h1>
                            </div>
                        </div>
                    </div>

                    {/* <!-- CAROUSEL --> */}
                    <div className="row">
                        <div className="col-12">
                            <div id="testimonialCarousel" className="carousel slide" data-bs-interval="false">
                                <div className="carousel-inner">

                                    {/* <!-- SLIDE 1 (Original) --> */}
                                    <div className="carousel-item active">
                                        <div className="row align-items-end">

                                            <div className="col-lg-4 col-md-12">
                                                <div className="card-person">
                                                    <div className="image-box">
                                                        <img src={personImg1} alt="Client" />
                                                    </div>
                                                    <div className="person-info">
                                                        <span>Rainbow-Themes</span>
                                                        <h3>Nevine Acotanza</h3>
                                                        <p>Chief Operating Officer</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-md-12">
                                                <div className="testimonial-top-bar">
                                                    <div className="testimonial-nav-buttons d-none d-md-flex">
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="prev">
                                                            <i className="fa-solid fa-arrow-left"></i>
                                                        </button>
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="next">
                                                            <i className="fa-solid fa-arrow-right"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="card-review">
                                                    <div className="review-header-box">
                                                        <div className="header-left">
                                                            <h3>Android App Development</h3>
                                                            <span className="date">via Upwork - Mar 4, 2015 - Aug 30, 2021</span>
                                                        </div>
                                                        <div className="header-right-stars">
                                                            <div className="stars">
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <hr className="review-divider" />
                                                    <div className="review-text">
                                                        <p>Maecenas finibus nec sem ut imperdiet. Ut tincidunt est ac dolor
                                                            aliquam sodales. Phasellus sed mauris hendrerit.Maecenas finibus nec sem ut imperdiet. Ut tincidunt est ac dolor
                                                            aliquam sodales. Phasellus sed mauris hendrerit.</p>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>

                                    {/* <!-- SLIDE 2 (Original) --> */}
                                    <div className="carousel-item">
                                        <div className="row align-items-end">

                                            <div className="col-lg-4 col-md-12">
                                                <div className="card-person">
                                                    <div className="image-box">
                                                        <img src={personImg2} alt="Client" />
                                                    </div>
                                                    <div className="person-info">
                                                        <span>Bound - Trolola</span>
                                                        <h3>Jone Duone Joe</h3>
                                                        <p>Operating Officer</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-md-12">
                                                <div className="testimonial-top-bar">
                                                    <div className="testimonial-nav-buttons d-none d-md-flex">
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="prev">
                                                            <i className="fa-solid fa-arrow-left"></i>
                                                        </button>
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="next">
                                                            <i className="fa-solid fa-arrow-right"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="card-review">
                                                    <div className="review-header-box">
                                                        <div className="header-left">
                                                            <h3>Web App Development</h3>
                                                            <span className="date">via Upwork - Mar 4, 2016 - Aug 30, 2021</span>
                                                        </div>
                                                        <div className="header-right-stars">
                                                            <div className="stars">
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <hr className="review-divider" />
                                                    <div className="review-text">
                                                        <p>Important fact to nec sem ut imperdiet. Ut tincidunt est ac dolor aliquam sodales.
                                                            Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.
                                                            Ut tincidunt est ac dolor aliquam sodales phasellus smauris.</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* <!-- SLIDE 3 --> */}
                                    <div className="carousel-item">
                                        <div className="row align-items-end">

                                            <div className="col-lg-4 col-md-12">
                                                <div className="card-person">
                                                    <div className="image-box">
                                                        <img src={personImg3} alt="Client" />
                                                    </div>
                                                    <div className="person-info">
                                                        <span>GLASSFISOM</span>
                                                        <h3>Nevine Dhawan</h3>
                                                        <p>CEO of Officer</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-md-12">

                                                <div className="testimonial-top-bar">
                                                    <div className="testimonial-nav-buttons d-none d-md-flex">
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="prev">
                                                            <i className="fa-solid fa-arrow-left"></i>
                                                        </button>
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="next">
                                                            <i className="fa-solid fa-arrow-right"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="card-review">
                                                    <div className="review-header-box">
                                                        <div className="header-left">
                                                            <h3>Android App Design</h3>
                                                            <span className="date">Fiver - Mar 4, 2015 - Aug 30, 2021</span>
                                                        </div>

                                                        <div className="header-right-stars">
                                                            <div className="stars">
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <hr className="review-divider" />
                                                    <div className="review-text">
                                                        <p>No more question for design. Ut tincidunt est ac dolor aliquam sodales.
                                                            Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.
                                                            Ut tincidunt est ac dolor aliquam sodales phasellus smauris.</p>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>

                                    {/* <!-- SLIDE 4 --> */}
                                    <div className="carousel-item">
                                        <div className="row align-items-end">

                                            <div className="col-lg-4 col-md-12">
                                                <div className="card-person">
                                                    <div className="image-box">
                                                        <img src={personImg4} alt="Client" />
                                                    </div>
                                                    <div className="person-info">
                                                        <span>NCD - DESIGN</span>
                                                        <h3>Mevine Thoda</h3>
                                                        <p>Marketing Officer</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-md-12">

                                                <div className="testimonial-top-bar">
                                                    <div className="testimonial-nav-buttons d-none d-md-flex">
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="prev">
                                                            <i className="fa-solid fa-arrow-left"></i>
                                                        </button>
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="next">
                                                            <i className="fa-solid fa-arrow-right"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="card-review">
                                                    <div className="review-header-box">
                                                        <div className="header-left">
                                                            <h3>CEO - Marketing</h3>
                                                            <span className="date">Thoda Department - Mar 4, 2018 - Aug 30, 2021</span>
                                                        </div>

                                                        <div className="header-right-stars">
                                                            <div className="stars">
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <hr className="review-divider" />
                                                    <div className="review-text">
                                                        <p>Marcent Of Vanice and treatment. Ut tincidunt est ac dolor aliquam sodales.
                                                            Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.
                                                            Ut tincidunt est ac dolor aliquam sodales phasellus smauris..</p>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>

                                    {/* <!-- SLIDE 5 --> */}
                                    <div className="carousel-item">
                                        <div className="row align-items-end">

                                            <div className="col-lg-4 col-md-12">
                                                <div className="card-person">
                                                    <div className="image-box">
                                                        <img src={personImg5} alt="Client" />
                                                    </div>
                                                    <div className="person-info">
                                                        <span>DEFAULT NAME</span>
                                                        <h3>Davei Lauce</h3>
                                                        <p>Chief Operating Manager</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-md-12">

                                                <div className="testimonial-top-bar">
                                                    <div className="testimonial-nav-buttons d-none d-md-flex">
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="prev">
                                                            <i className="fa-solid fa-arrow-left"></i>
                                                        </button>
                                                        <button className="nav-btn" data-bs-target="#testimonialCarousel"
                                                            data-bs-slide="next">
                                                            <i className="fa-solid fa-arrow-right"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="card-review">
                                                    <div className="review-header-box">
                                                        <div className="header-left">
                                                            <h3>Android App Development</h3>
                                                            <span className="date">via Upwork - Mar 4, 2015 - Aug 30, 2021</span>
                                                        </div>

                                                        <div className="header-right-stars">
                                                            <div className="stars">
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <hr className="review-divider" />
                                                    <div className="review-text">
                                                        <p>When managment is so important. Ut tincidunt est ac dolor aliquam sodales.
                                                            Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.
                                                            Ut tincidunt est ac dolor aliquam sodales phasellus smauris.</p>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* <!-- DOTS --> */}
                                <div className="carousel-indicators">
                                    <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="0" className="active"></button>
                                    <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="1"></button>
                                    <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="2"></button>
                                    <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="3"></button>
                                    <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="4"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <hr className="hr-1"></hr>
        </>
    );
};

export default Testimonials;
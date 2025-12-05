import './contact.css'
import contact1 from '../assets/media/contact_section/contact1.png';

const Contact = () => {
    return(
        <>
            <section className="contact-section" id="contact">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-12">
                            <span className="subtitle">CONTACT</span>
                            <br/>
                            <h2 className="title">Contact With Me</h2>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-5 col-md-12 mb-4 mb-lg-0">
                            <div className="contact-card h-100">
                                <div className="image-wrapper">
                                    <img src={contact1} alt="Handshake" className="img-fluid"/>
                                </div>
                                <div className="contact-details mt-4">
                                    <h3>Nevine Acotanza</h3>
                                    <span className="job-title">Chief Operating Officer</span>
                                    <p className="description">
                                        I am available for freelance work. Connect with me via and call in to my account.
                                    </p>
                                    <div className="contact-info">
                                        <p>Phone: <span>+01234567890</span></p>
                                        <p>Email: <span>admin@example.com</span></p>
                                    </div>
                                    
                                    <div className="social-area mt-4">
                                        <span className="find-me">FIND WITH ME</span>
                                        <div className="social-icons mt-3">
                                            <a href="#" className="social-btn"><i className="fab fa-facebook-f"></i></a>
                                            <a href="#" className="social-btn"><i className="fab fa-linkedin-in"></i></a>
                                            <a href="#" className="social-btn"><i className="fab fa-instagram"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7 col-md-12">
                            <div className="contact-card h-100">
                                <form className="contact-form">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6 col-12 mb-3">
                                            <div className="form-group">
                                                <label>YOUR NAME</label>
                                                <input type="text" className="form-control" name="name"/>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-12 mb-3">
                                            <div className="form-group">
                                                <label>PHONE NUMBER</label>
                                                <input type="text" className="form-control" name="phone"/>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group mb-3">
                                        <label>EMAIL</label>
                                        <input type="email" className="form-control" name="email"/>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label>SUBJECT</label>
                                        <input type="text" className="form-control" name="subject"/>
                                    </div>

                                    <div className="form-group mb-4">
                                        <label>YOUR MESSAGE</label>
                                        <textarea className="form-control" name="message" rows="6"></textarea>
                                    </div>

                                    <button type="submit" className="w-100 submit-btn">
                                        SEND MESSAGE <i className="fas fa-arrow-right ms-2"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="hr-1"></hr>
            </section>
        </>
    );
};

export default Contact;
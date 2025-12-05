import './footer.css';
import person1 from '../assets/media/nams_black.png';

const Footer = () => {
    return(
        <>
           <footer className="footer-section">
                <div className="container">
                    <div className="row justify-content-center text-center">
                        <div className="col-4">
                            <div className="footer-logo text-center">
                                <img src={person1} alt="Logo" className="footer-img"/>
                            </div>
                            
                            <p className="footer-copyright">
                                &copy; 2025. All rights reserved by Namra Pithwa.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
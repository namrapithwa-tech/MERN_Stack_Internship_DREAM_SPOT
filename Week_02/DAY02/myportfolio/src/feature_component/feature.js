import { useEffect } from 'react';
import './feature.css';
import featureCardAnimation from './feature_cardanimation';
import internet from '../assets/icons/features_section/internet.png';
import menubar from '../assets/icons/features_section/menu-bar.png';
import mobiledevlopment from '../assets/icons/features_section/mobile-development.png';
import professionaldevlopment from '../assets/icons/features_section/professional-development.png';
import rightarrow from '../assets/icons/features_section/right-arrow.png';
import seo from '../assets/icons/features_section/seo.png';
import technology from '../assets/icons/features_section/technology.png';


const Feature = () => {

    useEffect(() => {
        featureCardAnimation();
    }, []);

    return (
        <>
            <div className="container feature-section">

                <p className="text-uppercase feature-color">Features</p>
                <h2 className="feature-title">What I Do</h2>

                <div className="row mt-3 g-4">
                    {/* <!-- Card 1 --> */}
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="feature-icon"><img src={menubar}/></div>
                            <h4 className="feature-subtitle">Business Strategy</h4>
                            <p className="text-light">
                                I throw myself down among the tall grass by the stream as I lie close to the earth.
                            </p>
                            <div className="feature-icon-arrow mt-4"><img src={rightarrow}/></div>
                        </div>
                    </div>

                    {/* <!-- Card 2 --> */}
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="feature-icon"><img src={internet}/></div>
                            <h4 className="feature-subtitle">Webapp Development</h4>
                            <p className="text-light">
                                It uses a dictionary of over 200 Latin words, combined with a handful of model sentences.
                            </p>
                            <div className="feature-icon-arrow mt-4"><img src={rightarrow}/></div>
                        </div>
                    </div>

                    {/* <!-- Card 3 --> */}
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="feature-icon"><img src={mobiledevlopment}/></div>
                            <h4 className="feature-subtitle">Mobile App Development</h4>
                            <p className="text-light">
                                I throw myself down among the tall grass by the stream as I lie close to the earth.
                            </p>
                            <div className="feature-icon-arrow mt-4"><img src={rightarrow}/></div>
                        </div>
                    </div>

                    {/* <!-- Card 4 --> */}
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="feature-icon"><img src={technology}/></div>
                            <h4 className="feature-subtitle">IOT Development</h4>
                            <p className="text-light">
                                I throw myself down among the tall grass by the stream as I lie close to the earth.
                            </p>
                            <div className="feature-icon-arrow mt-4"><img src={rightarrow}/></div>
                        </div>
                    </div>

                    {/* <!-- Card 5 --> */}
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="feature-icon"><img src={seo}/></div>
                            <h4 className="feature-subtitle">SEO Markeating</h4>
                            <p className="text-light">
                                It uses a dictionary of over 200 Latin words, combined with a handful of model sentences.
                            </p>
                            <div className="feature-icon-arrow mt-4"><img src={rightarrow}/></div>
                        </div>
                    </div>

                    {/* <!-- Card 6 --> */}
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="feature-icon"><img src={professionaldevlopment}/></div>
                            <h4 className="feature-subtitle">Portfolio Development</h4>
                            <p className="text-light">
                                I throw myself down among the tall grass by the stream as I lie close to the earth.
                            </p>
                            <div className="feature-icon-arrow mt-4"><img src={rightarrow}/></div>
                        </div>
                    </div>

                </div>
            </div>


            <hr className="hr-1"></hr>
        </>
    );
}

export default Feature;
import { useEffect } from 'react';
import './herosection.css';
import typeanimation from './typewriter_animation.js';
import rightCardAnimation from './rightcard_animation.js';
import rightImage from '../assets/media/nams_black.png';
import socilalLinkdln from '../assets/icons/hero_section/linkedin.png';
import socilalCall from '../assets/icons/hero_section/call.png';
import socilalInstagram from '../assets/icons/hero_section/instagram.png';
import skillReact from '../assets/icons/hero_section/react.png';
import skillDotnet from '../assets/icons/hero_section/net.png';
import skillPython from '../assets/icons/hero_section/python.png';

const HeroSection = () => {

    useEffect(() => {
        typeanimation();
        rightCardAnimation();
    }, []);

    return (
        <>
            <div className="container py-5">
                <div className="row align-items-center">

                    {/* Left Text */}
                    <div className="col-md-6 mt-5">
                        <p className="text-uppercase text-welcome small">WELCOME TO MY WORLD</p>

                        <h1 className="hero-title">
                            Hi, I'm <span>Namra Pithwa</span>
                        </h1>

                        <div className="type-container">
                            <span>a &nbsp;</span>
                            <span className="typed-text"></span>
                            <span className="cursor"></span>
                        </div>


                        <p className="mt-4 text-light">
                            I use animation as a third dimension to simplify experiences and
                            guide every interaction. I'm not adding motion just to decorate
                            things, but to enhance the user's experience.
                        </p>


                        <div className="row">
                            {/* FIND WITH ME */}
                            <div className="col mt-4">
                                <p>FIND WITH ME</p>
                                <div className="d-flex">
                                    <div className="social-box"><img src={socilalLinkdln} width="24" /></div>
                                    <div className="social-box"><img src={socilalCall} width="24" /></div>
                                    <div className="social-box"><img src={socilalInstagram} width="24" /></div>
                                </div>
                            </div>

                            {/* SKILLS */}
                            <div className="col mt-4">
                                <p>BEST SKILL ON</p>
                                <div className="d-flex">
                                    <div className="skill-box"><img src={skillReact} width="28" /></div>
                                    <div className="skill-box"><img src={skillDotnet} width="28" /></div>
                                    <div className="skill-box"><img src={skillPython} width="28" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="col-md-6 text-center right-card">
                        <img src={rightImage} alt="Profile" className="img-fluid rounded-5" />
                    </div>
                </div>
            </div>

            <hr className="hr-1"></hr>
        </>
    );
}

export default HeroSection;

// useEffect ni error etle aavti ti bcoz start thay tyare null thay jatu tu etle type wrtier ma null 
// avoid karavyu and right card ma card me varible hato pachi ene rightCardAnimation() ma convert karyu.
// and niche script tag ma pan muki ne joyu na chalyu
// and haji feature section pending che.
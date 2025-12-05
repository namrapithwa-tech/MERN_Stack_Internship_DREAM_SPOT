import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="form-holder">
            <div className="form-content">
                <div className="form-items">
                    <h3 className="form-title">Welcome to My First React Form Demo</h3>
                    <p>This is a simple homepage designed using your custom CSS.</p>

                    <button className="btn btn-primary w-100 mt-3" onClick={() => navigate("/form")}>
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;

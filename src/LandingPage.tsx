import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from './Logo';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/signin');
    };

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="logo-section">
                    <AnimatedLogo />
                </div>
                <div className="action-section">
                    <button className="continue-button" onClick={handleContinue}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

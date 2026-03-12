import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageLoader.css';

const PageLoader = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Only show if the navigation state says 'fromLogin'
        if (location.state?.fromLogin) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1500); // Majestic transition

            return () => clearTimeout(timer);
        }
    }, [location.pathname, location.state]);

    if (!loading) return null;

    return (
        <div className="page-loader-overlay">
            <div className="page-loader-content">
                <div className="loader-logo">
                    <span className="logo-icon">EP</span>
                    <span className="logo-text">Edu_Point</span>
                </div>
                <div className="loader-spinner-wrap">
                    <div className="loader-spinner"></div>
                </div>
                <div className="loader-progress-bar">
                    <div className="loader-progress-fill"></div>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;

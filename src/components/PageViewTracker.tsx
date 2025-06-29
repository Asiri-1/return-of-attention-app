import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics'; // Corrected import
// import { useAuth } from '../AuthContext'; // Only import if actually used elsewhere in this component

const PageViewTracker: React.FC = () => {
  const location = useLocation();
  // const { currentUser } = useAuth(); // Only uncomment if you need currentUser for something else in this component

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    // const pageTitle = document.title; // Not used by trackPageView currently

    trackPageView(pagePath); // Call trackPageView with the pagePath

    console.log(`Page view tracked: ${pagePath}`);

  }, [location]); // Re-run effect when location changes

  return null;
};

export default PageViewTracker;
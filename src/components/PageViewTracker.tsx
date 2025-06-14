import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { useAuth } from '../AuthContext'; // Import useAuth

const PageViewTracker: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth(); // Get currentUser from AuthContext

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    const pageTitle = document.title;

    trackEvent({
      event_name: 'page_view',
      page_path: pagePath,
      page_title: pageTitle,
    }, currentUser?.email || undefined); // Pass user ID or email, ensure it's string or undefined

    console.log(`Page view tracked: ${pagePath}`);

  }, [location, currentUser]); // Re-run effect when location or currentUser changes

  return null;
};

export default PageViewTracker;

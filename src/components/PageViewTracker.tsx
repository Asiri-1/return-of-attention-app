import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../utils/analytics'; // Import your trackEvent utility

const PageViewTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // This effect runs every time the 'location' object changes (i.e., route changes)
    const pagePath = location.pathname + location.search; // Get full path including query params
    const pageTitle = document.title; // Get the current document title

    trackEvent({
      event_name: 'page_view',
      page_path: pagePath,
      page_title: pageTitle,
      // Add other common properties here later, like user_id, session_id, etc.
      // For now, we'll just send page_path and page_title
    });

    // Optional: Log to console for debugging
    console.log(`Page view tracked: ${pagePath}`);

  }, [location]); // Re-run effect whenever location changes

  return null; // This component doesn't render anything visible
};

export default PageViewTracker;


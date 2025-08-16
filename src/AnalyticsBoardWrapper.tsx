import React from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import AnalyticsBoard from './AnalyticsBoard';
import MainNavigation from './MainNavigation';

const AnalyticsBoardWrapper: React.FC = () => {
  const { currentUser } = useAuth();
  const { isLoading } = usePractice();

  // Authentication check
  if (!currentUser) {
    return (
      <MainNavigation>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <div>Please log in to view analytics</div>
        </div>
      </MainNavigation>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <MainNavigation>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <div>Loading analytics...</div>
        </div>
      </MainNavigation>
    );
  }

  return (
    <MainNavigation>
      <AnalyticsBoard />
    </MainNavigation>
  );
};

export default AnalyticsBoardWrapper;
import React from 'react';
import AnalyticsBoard from './AnalyticsBoard';
// Remove BrowserRouter, Routes, Route, Navigate, useNavigate imports as they are not needed here

const AnalyticsBoardWrapper: React.FC = () => {
  return (
    // Removed <BrowserRouter>
    <AnalyticsBoard />
    // Removed </BrowserRouter>
  );
};

export default AnalyticsBoardWrapper;

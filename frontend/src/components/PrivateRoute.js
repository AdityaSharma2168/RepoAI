import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute component that checks if user is authenticated
 * If authenticated, renders the child components
 * If not authenticated, redirects to login page
 */
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }
  
  // Return child components if authenticated
  return children;
}

export default PrivateRoute; 
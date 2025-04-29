import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const adminEmail = localStorage.getItem('adminEmail');
  const adminMobile = localStorage.getItem('adminMobile');
  const location = useLocation();

  // Check user roles
  const isSunil =
    adminEmail === 'sunilshendge0304@gmail.com' &&
    adminMobile === '7219015613';

  const isAbhilipne =
    adminEmail === 'abhilipne2017@gmail.com' &&
    adminMobile === '9130203486';

  if (!token) {
    // Redirect to login if no token (user is not authenticated)
    return <Navigate to="/login" replace />;
  }

  if (isSunil) {
    // Sunil can only access the summary page
    if (location.pathname !== '/summary') {
      return <Navigate to="/summary" replace />;
    }
  } else if (isAbhilipne) {
    // Abhilipne can access all pages, including dashboard child routes
    return children;
  } else {
    // Other users cannot access summary or dashboard
    if (location.pathname === '/summary' || location.pathname === '/dashboard') {
      return <Navigate to="/withdrawal-list" replace />;
    }
  }

  // Render children for allowed routes
  return children;
};

export default AuthenticatedRoute;

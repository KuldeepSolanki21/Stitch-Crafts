import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('adminAccessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  const isAuth = true;
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

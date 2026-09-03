import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useUserStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const adminSession = useAppStore((state) => state.adminSession);
  const location = useLocation();
  return adminSession
    ? children
    : <Navigate to="/admin/login" replace state={{ from: location }} />;
}

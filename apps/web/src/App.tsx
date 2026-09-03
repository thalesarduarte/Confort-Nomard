import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { SearchPage } from '@/features/search/SearchPage';
import { CityResultsPage } from '@/features/results/CityResultsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const App: React.FC = () => {
  const { profile, tempProfile } = useUserStore();
  const hasProfile = !!(profile || tempProfile);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={hasProfile ? '/search' : '/onboarding'} replace />}
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/city/:id" element={<CityResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;


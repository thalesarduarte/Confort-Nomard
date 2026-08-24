import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { SearchPage } from '@/features/search/SearchPage';
import { CityResultsPage } from '@/features/results/CityResultsPage';

const App: React.FC = () => {
  const { profile } = useUserStore();

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={profile ? "/search" : "/onboarding"} replace />} 
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/city/:id" element={<CityResultsPage />} />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;

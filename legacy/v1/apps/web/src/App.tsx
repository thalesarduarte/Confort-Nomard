import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { SearchPage } from '@/features/search/SearchPage';
import { CityResultsPage } from '@/features/results/CityResultsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LandingPage, FavoritesPage, ComparePage, CommunityPage, PartnersPage, B2BPage } from '@/features/local/LocalPages';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/city/:id" element={<CityResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/business" element={<B2BPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<main style={{padding:'4rem',textAlign:'center'}}><h1>Essa página ainda não foi encontrada</h1><a href="/">Voltar ao início</a></main>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;


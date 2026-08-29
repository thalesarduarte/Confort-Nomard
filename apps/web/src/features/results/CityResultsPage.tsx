import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCityStore } from '@/store/useCityStore';
import { useUserStore } from '@/store/useUserStore';
import { citiesService } from '@/services/cities.service';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Spinner } from '@/components/ui/Spinner';
import { ClimateModule } from './ClimateModule';
import { FoodModule } from './FoodModule';
import { LocationModule } from './LocationModule';
import { CultureModule } from './CultureModule';
import { AiRecommendationsPanel } from './AiRecommendationsPanel';
import styles from './CityResultsPage.module.css';

type Tab = 'climate' | 'food' | 'location' | 'culture' | 'ai';

export const CityResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const cityStore = useCityStore();
  const [activeTab, setActiveTab] = useState<Tab>('climate');

  useEffect(() => {
    if (!id) {
      navigate('/search');
      return;
    }

    const loadData = async () => {
      cityStore.setLoading(true);
      try {
        const sensitivity = profile?.thermalSensitivity ?? 'TOLERANT';
        const comfortFoods = profile?.comfortFoods ?? [];
        const budget = profile?.budgetMonthlyUsd ?? 2000;
        const currency = 'USD';
        const openness = profile?.culturalOpenness ?? 5;

        const [overview, climate, food, location, culture] = await Promise.all([
          citiesService.getCityOverview(id, profile || undefined),
          citiesService.getCityClimate(id, sensitivity),
          citiesService.getFoodCompatibility(id, comfortFoods),
          citiesService.getNeighborhoods(id, budget, currency),
          citiesService.getCultureInsights(id, openness),
        ]);

        cityStore.setCityData({
          currentCityId: id,
          overview,
          climate,
          food,
          location,
          culture,
        });
      } catch (err) {
        console.error(err);
      } finally {
        cityStore.setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (cityStore.loading || !cityStore.overview) {
    return (
      <PageWrapper className={styles.loadingWrapper}>
        <Spinner size="lg" />
        <p>Analisando compatibilidade...</p>
      </PageWrapper>
    );
  }

  const { city, overallScore } = cityStore.overview;

  return (
    <PageWrapper className={styles.page}>
      <div className={styles.hero}>
        <div 
          className={styles.heroBg} 
          style={{ backgroundImage: `url(${city.imageUrl})` }}
        />
        <div className={styles.heroOverlay} />
        
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.cityName}>{city.name}</h1>
            <p className={styles.countryName}>{city.country}</p>
            <p className={styles.tagline}>{city.tagline}</p>
          </div>
          <div className={styles.scoreWrapper}>
            <ScoreRing score={overallScore} size={140} strokeWidth={10} />
            <span className={styles.scoreLabel}>Compatibilidade</span>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {[
          { id: 'climate', icon: '🌡', label: 'Clima' },
          { id: 'food', icon: '🍽', label: 'Comida' },
          { id: 'location', icon: '🏘', label: 'Bairros' },
          { id: 'culture', icon: '🌐', label: 'Cultura' },
          { id: 'ai', icon: '✨', label: 'IA' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id as Tab)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.moduleContainer}>
        {activeTab === 'climate' && cityStore.climate && (
          cityStore.climate.monthlyData.length === 0
            ? <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>⏳ {cityStore.climate.summary}</div>
            : <ClimateModule data={cityStore.climate} />
        )}
        {activeTab === 'food' && cityStore.food && (
          cityStore.food.topEstablishments.length === 0 && cityStore.food.availableFoods.length === 0
            ? <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>⏳ {cityStore.food.summary}</div>
            : <FoodModule data={cityStore.food} />
        )}
        {activeTab === 'location' && cityStore.location && (
          cityStore.location.neighborhoods.length === 0
            ? <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>🏘 Ainda não temos dados de bairros curados para esta cidade.</div>
            : <LocationModule data={cityStore.location} />
        )}
        {activeTab === 'culture' && cityStore.culture && (
          cityStore.culture.insights.length === 0
            ? <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>🌐 Ainda não temos insights culturais curados para esta cidade.</div>
            : <CultureModule data={cityStore.culture} />
        )}
        {activeTab === 'ai' && <AiRecommendationsPanel cityName={city.name} />}
      </div>
    </PageWrapper>
  );
};

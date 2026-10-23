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
import { useLocalDataStore } from '@/store/useLocalDataStore';
import { services } from '@/services';
import type { CityData } from '@/services/types';

type Tab = 'climate' | 'food' | 'location' | 'culture' | 'ai';

export const CityResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const cityStore = useCityStore();
  const setLoading = useCityStore(state => state.setLoading);
  const setCityStoreData = useCityStore(state => state.setCityData);
  const { favorites, compared, toggleFavorite, toggleCompare } = useLocalDataStore();
  const [activeTab, setActiveTab] = useState<Tab>('climate');
  const [cityData, setCityDetails] = useState<CityData | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/search');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const cityDetails = await services.cities.detail(id);
        setCityDetails(cityDetails);
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

        setCityStoreData({
          currentCityId: id,
          overview,
          climate,
          food,
          location,
          culture,
        });
      } catch (err) {
        console.error(err);
        setCityDetails(null);
      } finally {
      setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, profile, setCityStoreData, setLoading]);

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
          style={{ backgroundImage: city.imageUrl ? `url(${city.imageUrl})` : undefined }}
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

      <section aria-label="Compatibilidade por pilar" style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center',padding:'1rem 0'}}>
        <span>Clima {cityStore.climate?.score ?? 0}%</span>
        <span>Comida {cityStore.food?.score ?? 0}%</span>
        <span>Bairros {cityStore.location?.score ?? 0}%</span>
        <span>Cultura {cityStore.culture?.receptivityScore ?? 0}%</span>
        <button onClick={()=>toggleFavorite(city.id)}>{favorites.includes(city.id)?'♥ Salvo':'♡ Favoritar'}</button>
        <button onClick={()=>toggleCompare(city.id)}>{compared.includes(city.id)?'✓ Comparando':'Comparar'}</button>
        <button onClick={()=>void navigator.clipboard?.writeText(window.location.href)}>Compartilhar</button>
      </section>

      <section aria-label="Explicação da compatibilidade e procedência dos dados" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',gap:16,margin:'0 0 1.5rem'}}>
        <details style={{padding:18,border:'1px solid var(--border)',borderRadius:16,background:'var(--surface)'}}>
          <summary style={{cursor:'pointer',fontWeight:700}}>Como suas preferências influenciam a pontuação</summary>
          {services.recommendations.scoreBreakdown(city.id,profile??undefined)?.pillars.map(p=><p key={p.id}><strong>{p.label}: {p.score}% · peso {p.weight.toFixed(1)}</strong><br/><small>{p.explanation}</small></p>)}
          <small>A média ponderada usa os critérios e prioridades do seu perfil. Os mesmos critérios são usados na tela Comparar.</small>
        </details>
        {cityData&&<details style={{padding:18,border:'1px solid var(--border)',borderRadius:16,background:'var(--surface)'}}><summary style={{cursor:'pointer',fontWeight:700}}>Fontes, atualização e confiança</summary><p>Os dados deste protótipo são sintéticos e ilustrativos; confiança baixa.</p>{([['Custo',cityData.provenance.cost],['Clima',cityData.provenance.climate],['Segurança',cityData.provenance.safety]] as const).map(([label,source])=><p key={label}><strong>{label}</strong> · {source.source}<br/><small>Atualizado em {new Date(`${source.updatedAt}T12:00:00`).toLocaleDateString('pt-BR')} · confiança {source.confidence}. {source.note}</small></p>)}</details>}
      </section>

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

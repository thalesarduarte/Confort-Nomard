import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { citiesService } from '@/services/cities.service';
import { CitySummary } from '@/types';
import styles from './SearchPage.module.css';

export const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySummary[]>([]);
  const [popular, setPopular] = useState<CitySummary[]>([]);

  useEffect(() => {
    citiesService.getPopularCities().then(setPopular);
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(() => {
        citiesService.searchCities(query).then(setResults);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelectCity = (id: string) => {
    navigate(`/city/${id}`);
  };

  return (
    <PageWrapper>
      <div className={styles.hero}>
        <h1 className={`gradient-text ${styles.title}`}>
          {t('hero.title', 'Para onde você quer ir?')}
        </h1>
        <p className={styles.subtitle}>
          {t('hero.subtitle', 'Descubra se uma cidade combina com você antes de chegar')}
        </p>

        <div className={styles.searchWrapper}>
          <Input 
            className={styles.searchInput}
            placeholder={t('hero.searchPlaceholder', 'Ex: Tóquio, Lisboa, Berlim...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<span style={{fontSize: '1.25rem'}}>🔍</span>}
          />
          
          {results.length > 0 && (
            <div className={styles.dropdown}>
              {results.map(city => (
                <div 
                  key={city.id} 
                  className={styles.dropdownItem}
                  onClick={() => handleSelectCity(city.id)}
                >
                  <span className={styles.cityIcon}>📍</span>
                  <div>
                    <div className={styles.cityName}>{city.name}</div>
                    <div className={styles.countryName}>{city.country}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Destinos Populares</h2>
        <div className={styles.grid}>
          {popular.map((city, idx) => (
            <Card 
              key={city.id}
              className={`${styles.cityCard} delay-${(idx % 5) * 100} animate-slide-up`}
              onClick={() => handleSelectCity(city.id)}
              glow
            >
              <div 
                className={styles.cityImage} 
                style={{ backgroundImage: `url(${city.imageUrl})` }}
              />
              <div className={styles.cityInfo}>
                <h3 className={styles.cityNameCard}>{city.name}</h3>
                <p className={styles.countryNameCard}>{city.country}</p>
                <p className={styles.tagline}>{city.tagline}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

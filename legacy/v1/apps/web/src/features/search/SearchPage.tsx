import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { citiesService } from "@/services/cities.service";
import { aiService } from "@/services/ai.service";
import { useUserStore } from "@/store/useUserStore";
import { CitySummary, DestinationRecommendation } from "@/types";
import styles from "./SearchPage.module.css";
import { useLocalDataStore } from "@/store/useLocalDataStore";

export const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, tempProfile } = useUserStore();
  const activeProfile = profile ?? tempProfile;
  const { favorites, compared, toggleFavorite, toggleCompare } = useLocalDataStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CitySummary[]>([]);
  const [popular, setPopular] = useState<CitySummary[]>([]);
  const [recommendations, setRecommendations] = useState<DestinationRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    citiesService.getPopularCities().then(setPopular);
  }, []);

  // Load AI recommendations when profile is available
  useEffect(() => {
    if (!activeProfile) return;
    setRecsLoading(true);
    aiService
      .recommendDestinations(activeProfile, {
        freeformTags: (activeProfile as any).freeformTags,
        priorityRanking: (activeProfile as any).priorityRanking,
        maxItems: 6,
      })
      .then(setRecommendations)
      .catch(() => {
        // Fail silently â€” section simply won't appear
        setRecommendations([]);
      })
      .finally(() => setRecsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          {t("hero.title", "Para onde você quer ir?")}
        </h1>
        <p className={styles.subtitle}>
          {t("hero.subtitle", "Descubra se uma cidade combina com você antes de chegar")}
        </p>

        <div className={styles.searchWrapper}>
          <Input
            className={styles.searchInput}
            placeholder={t("hero.searchPlaceholder", "Ex.: Tóquio, Lisboa, Berlim...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<span aria-hidden="true" style={{ fontSize: "1.25rem" }}>⌕</span>}
          />

          {results.length > 0 && (
            <div className={styles.dropdown}>
              {results.map((city) => (
                <div
                  key={city.id}
                  className={styles.dropdownItem}
                  onClick={() => handleSelectCity(city.id)}
                >
                  <span className={styles.cityIcon} aria-hidden="true">⌖</span>
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

      {/* AI Recommendations â€” only when profile exists */}
      {activeProfile && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>âœ¨ Recomendado pra voce</h2>
          {recsLoading ? (
            <div className={styles.recsLoading}>
              <span>Personalizando suas recomendacoes...</span>
            </div>
          ) : recommendations.length > 0 ? (
            <div className={styles.grid}>
              {recommendations.map((rec, idx) => (
                <Card
                  key={rec.cityId}
                  className={`${styles.cityCard} delay-${(idx % 5) * 100} animate-slide-up`}
                  onClick={() => handleSelectCity(rec.cityId)}
                  glow
                >
                  <div
                    className={styles.cityImage}
                    style={{
                      backgroundImage: rec.imageUrl ? `url(${rec.imageUrl})` : undefined,
                      background: rec.imageUrl ? undefined : "radial-gradient(circle at 78% 22%, #f2c58f 0 9%, transparent 9.5%), linear-gradient(135deg, #9eb9a2, #527b68 60%, #d0a078)",
                    }}
                  >
                    <span className={styles.matchBadge}>{rec.matchScore}% match</span>
                  </div>
                  <div className={styles.cityInfo}>
                    <h3 className={styles.cityNameCard}>{rec.cityName}</h3>
                    <p className={styles.countryNameCard}>{rec.country}</p>
                    <p className={styles.tagline}>{rec.reason}</p>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button aria-label="Favoritar cidade" onClick={(e)=>{e.stopPropagation();toggleFavorite(rec.cityId);}}>{favorites.includes(rec.cityId)?'♥':'♡'}</button>
                      <button aria-label="Adicionar à comparação" onClick={(e)=>{e.stopPropagation();toggleCompare(rec.cityId);}}>{compared.includes(rec.cityId)?'✓ Comparando':'Comparar'}</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {!activeProfile && (
        <div className={styles.section}>
          <div className={styles.ctaBanner}>
          <span aria-hidden="true">🧭</span>
            <div>
              <strong>Descubra quais cidades combinam com você</strong>
              <p>Conte o que importa para você e receba recomendações personalizadas.</p>
            </div>
            <button className={styles.ctaBtn} onClick={() => navigate("/onboarding")}>
              Começar
            </button>
          </div>
        </div>
      )}

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
                style={{ backgroundImage: city.imageUrl ? `url(${city.imageUrl})` : undefined }}
              />
              <div className={styles.cityInfo}>
                <h3 className={styles.cityNameCard}>{city.name}</h3>
                <p className={styles.countryNameCard}>{city.country}</p>
                <p className={styles.tagline}>{city.tagline}</p>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <button aria-label="Favoritar cidade" onClick={(e)=>{e.stopPropagation();toggleFavorite(city.id);}}>{favorites.includes(city.id)?'♥':'♡'}</button>
                  <button aria-label="Adicionar à comparação" onClick={(e)=>{e.stopPropagation();toggleCompare(city.id);}}>{compared.includes(city.id)?'✓ Comparando':'Comparar'}</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

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

export const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, tempProfile } = useUserStore();
  const activeProfile = profile ?? tempProfile;

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
          {t("hero.title", "Para onde voce quer ir?")}
        </h1>
        <p className={styles.subtitle}>
          {t("hero.subtitle", "Descubra se uma cidade combina com voce antes de chegar")}
        </p>

        <div className={styles.searchWrapper}>
          <Input
            className={styles.searchInput}
            placeholder={t("hero.searchPlaceholder", "Ex: Toquio, Lisboa, Berlim...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<span style={{ fontSize: "1.25rem" }}>ðŸ”</span>}
          />

          {results.length > 0 && (
            <div className={styles.dropdown}>
              {results.map((city) => (
                <div
                  key={city.id}
                  className={styles.dropdownItem}
                  onClick={() => handleSelectCity(city.id)}
                >
                  <span className={styles.cityIcon}>ðŸ“</span>
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
                      background: rec.imageUrl ? undefined : "linear-gradient(135deg, #1e1b4b, #312e81)",
                    }}
                  >
                    <span className={styles.matchBadge}>{rec.matchScore}% match</span>
                  </div>
                  <div className={styles.cityInfo}>
                    <h3 className={styles.cityNameCard}>{rec.cityName}</h3>
                    <p className={styles.countryNameCard}>{rec.country}</p>
                    <p className={styles.tagline}>{rec.reason}</p>
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
            <span>ðŸ§­</span>
            <div>
              <strong>Descubra quais cidades combinam com voce</strong>
              <p>Complete o onboarding para ver recomendacoes personalizadas pela IA.</p>
            </div>
            <button className={styles.ctaBtn} onClick={() => navigate("/onboarding")}>
              Comecar
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

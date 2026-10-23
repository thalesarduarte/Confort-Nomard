import React, { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { citiesService } from '@/services/cities.service';
import { aiService, CityRecommendationsResponse } from '@/services/ai.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import styles from './Modules.module.css';
import panelStyles from './AiRecommendationsPanel.module.css';

const TYPE_ICON: Record<'food' | 'neighborhood' | 'culture', string> = {
  food: '🍽',
  neighborhood: '🏘',
  culture: '🌐',
};

interface Props {
  cityName: string;
}

type Status = 'idle' | 'resolving' | 'loading' | 'ready' | 'unavailable' | 'error';

export const AiRecommendationsPanel: React.FC<Props> = ({ cityName }) => {
  const { profile, tempProfile } = useUserStore();
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<CityRecommendationsResponse | null>(null);
  const [realCityId, setRealCityId] = useState<string | null>(null);

  const load = useCallback(async (cityId: string) => {
    setStatus('loading');
    try {
      const freeformTags = (tempProfile as any)?.freeformTags ?? undefined;
      const result = await aiService.getCityRecommendations(
        cityId,
        profile ?? undefined,
        freeformTags,
        'pt-BR',
      );
      setData(result);
      setStatus('ready');
    } catch (err: any) {
      if (err?.response?.status === 503) {
        setStatus('unavailable');
      } else {
        setStatus('error');
      }
    }
  }, [profile, tempProfile]);

  useEffect(() => {
    let cancelled = false;
    setStatus('resolving');

    citiesService.resolveRealCityId(cityName).then((id) => {
      if (cancelled) return;
      if (!id) {
        // City has no seed data — silently render nothing
        setStatus('unavailable');
        return;
      }
      setRealCityId(id);
      load(id);
    });

    return () => { cancelled = true; };
  }, [cityName, load]);

  // City not in DB — render nothing (no error shown to user)
  if (status === 'unavailable' || status === 'idle' || status === 'resolving') {
    if (status === 'resolving') {
      return (
        <div className={panelStyles.centerWrapper}>
          <Spinner size="sm" />
        </div>
      );
    }
    return null;
  }

  if (status === 'loading') {
    return (
      <div className={panelStyles.centerWrapper}>
        <Spinner size="lg" />
        <p className={panelStyles.loadingText}>Gerando recomendações personalizadas com IA...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Card className={panelStyles.errorCard}>
        <p className={panelStyles.errorText}>Não foi possível carregar as recomendações de IA.</p>
        {realCityId && (
          <Button variant="secondary" size="sm" onClick={() => load(realCityId)}>
            Tentar de novo
          </Button>
        )}
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className={styles.moduleGrid}>
      <Card className={styles.mainCard}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.title}>✨ Recomendações com IA</h2>
            <p className={styles.summary}>{data.summary}</p>
          </div>
        </div>

        <div className={styles.list}>
          {data.highlights.map((highlight) => (
            <div key={highlight.refId} className={styles.listItem}>
              <div className={styles.itemMain}>
                <span className={styles.itemName}>
                  {TYPE_ICON[highlight.type]} {highlight.title}
                </span>
                <span className={styles.itemSub}>{highlight.reason}</span>
              </div>
            </div>
          ))}
        </div>

        {data.highlights.length === 0 && (
          <p className={panelStyles.emptyText}>
            Não há dados suficientes desta cidade para gerar recomendações personalizadas.
          </p>
        )}
      </Card>
    </div>
  );
};

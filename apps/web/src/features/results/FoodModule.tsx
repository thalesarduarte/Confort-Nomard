import React from 'react';
import { FoodOverview } from '@/types';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Chip } from '@/components/ui/Chip';
import styles from './Modules.module.css';

export const FoodModule: React.FC<{ data: FoodOverview }> = ({ data }) => {
  return (
    <div className={styles.moduleGrid}>
      <Card className={styles.mainCard}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.title}>Gastronomia & Conforto</h2>
            <p className={styles.summary}>{data.summary}</p>
          </div>
          <ScoreRing score={data.score} size={80} strokeWidth={6} />
        </div>

        <div className={styles.splitSection}>
          <div className={styles.half}>
            <h3 className={styles.subtitle}>Encontrado Fácil</h3>
            <div className={styles.chipGroup}>
              {data.availableFoods.map(f => (
                <Chip key={f} variant="success" icon="✅">{f}</Chip>
              ))}
            </div>
          </div>
          <div className={styles.half}>
            <h3 className={styles.subtitle}>Difícil de Achar</h3>
            <div className={styles.chipGroup}>
              {data.missingFoods.map(f => (
                <Chip key={f} variant="danger" icon="❌">{f}</Chip>
              ))}
            </div>
          </div>
        </div>

        <h3 className={styles.subtitle}>Top Estabelecimentos</h3>
        <div className={styles.list}>
          {data.topEstablishments.map((est, idx) => (
            <div key={idx} className={styles.listItem}>
              <div className={styles.itemMain}>
                <span className={styles.itemName}>{est.name}</span>
                <span className={styles.itemSub}>{est.cuisine}</span>
              </div>
              <span className={styles.priceTier}>{est.priceTier}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

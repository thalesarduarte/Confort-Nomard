import React from 'react';
import { LocationOverview } from '@/types';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './Modules.module.css';

export const LocationModule: React.FC<{ data: LocationOverview }> = ({ data }) => {
  return (
    <div className={styles.moduleGrid}>
      <Card className={styles.headerCard}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.title}>Custo de Vida & Bairros</h2>
            <p className={styles.summary}>Análise de bairros com base no seu orçamento mensal.</p>
          </div>
          <ScoreRing score={data.score} size={80} strokeWidth={6} />
        </div>
      </Card>

      <div className={styles.grid2Col}>
        {data.neighborhoods.map(nb => {
          const maxCost = 3000; // arbitrary max for progress bars
          return (
            <Card key={nb.id} className={styles.nestedCard} glow={nb.isRecommended}>
              <div className={styles.cardHeaderFlex}>
                <h3 className={styles.cardTitle}>{nb.name}</h3>
                {nb.isRecommended && <Badge variant="success">Recomendado</Badge>}
              </div>
              
              <div className={styles.totalCost}>
                <span className={styles.costValue}>${nb.monthlyCost.total}</span>
                <span className={styles.costLabel}>/mês</span>
              </div>

              <div className={styles.bars}>
                <ProgressBar 
                  label={`Aluguel ($${nb.monthlyCost.rent})`} 
                  value={(nb.monthlyCost.rent / maxCost) * 100} 
                  color="var(--accent-teal)" 
                />
                <ProgressBar 
                  label={`Comida ($${nb.monthlyCost.food})`} 
                  value={(nb.monthlyCost.food / maxCost) * 100} 
                  color="var(--accent-amber)" 
                />
                <ProgressBar 
                  label={`Transporte ($${nb.monthlyCost.transport})`} 
                  value={(nb.monthlyCost.transport / maxCost) * 100} 
                  color="var(--accent-violet)" 
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

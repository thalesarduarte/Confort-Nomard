import React from 'react';
import { ClimateOverview } from '@/types';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import styles from './Modules.module.css';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const ClimateModule: React.FC<{ data: ClimateOverview }> = ({ data }) => {
  return (
    <div className={styles.moduleGrid}>
      <Card className={styles.mainCard}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.title}>Clima & Conforto Térmico</h2>
            <p className={styles.summary}>{data.summary}</p>
          </div>
          <ScoreRing score={data.score} size={80} strokeWidth={6} />
        </div>

        <div className={styles.chartContainer}>
          {data.monthlyData.map((month, idx) => {
            const height = `${(month.maxTemp / 40) * 100}%`;
            const minHeight = `${(month.minTemp / 40) * 100}%`;
            const color = month.thermalComfort === 'IDEAL' 
              ? 'var(--accent-teal)' 
              : month.thermalComfort === 'TOLERABLE' 
                ? 'var(--accent-amber)' 
                : 'var(--accent-red)';
                
            return (
              <Tooltip 
                key={idx}
                position="top"
                content={
                  <div style={{ textAlign: 'center' }}>
                    <strong>{MONTHS[idx]}</strong>
                    <div>Temp: {Math.round(month.minTemp)}° a {Math.round(month.maxTemp)}°</div>
                    <div>Umidade: {Math.round(month.humidity)}%</div>
                  </div>
                }
              >
                <div className={styles.chartCol}>
                  <div className={styles.barArea}>
                    <div 
                      className={styles.bar} 
                      style={{ 
                        height, 
                        backgroundColor: color,
                        opacity: 0.8
                      }} 
                    />
                    <div 
                      className={styles.barMin} 
                      style={{ height: minHeight, backgroundColor: 'var(--bg-card)' }} 
                    />
                  </div>
                  <span className={styles.monthLabel}>{MONTHS[idx]}</span>
                </div>
              </Tooltip>
            );
          })}
        </div>

        <div className={styles.legend}>
          <Badge variant="info">Ideal</Badge>
          <Badge variant="warning">Tolerável</Badge>
          <Badge variant="danger">Desconfortável</Badge>
        </div>
      </Card>
    </div>
  );
};

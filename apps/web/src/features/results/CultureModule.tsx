import React from 'react';
import { CultureOverview } from '@/types';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import styles from './Modules.module.css';
import { useLocalDataStore } from '@/store/useLocalDataStore';

const CAT_ICONS: Record<string, string> = {
  SOCIAL: '🤝',
  SAFETY: '🔒',
  CUSTOMS: '🎭',
  LANGUAGE: '💬',
  BUREAUCRACY: '📋'
};

export const CultureModule: React.FC<{ data: CultureOverview }> = ({ data }) => {
  const { knownTips, toggleTip } = useLocalDataStore();
  return (
    <div className={styles.moduleGrid}>
      <Card className={styles.mainCard}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.title}>Cultura & Adaptação</h2>
            <p className={styles.summary}>{data.summary}</p>
          </div>
          <div className={styles.scoreGroup}>
            <div className={styles.smallScore}>
              <ScoreRing score={data.receptivityScore} size={60} strokeWidth={4} />
              <span>Receptividade</span>
            </div>
            <div className={styles.smallScore}>
              <ScoreRing score={data.languageScore} size={60} strokeWidth={4} />
              <span>Idioma</span>
            </div>
          </div>
        </div>

        <div className={styles.insightsList}>
          {data.insights.map(insight => {
            const severityColor = 
              insight.severity === 'INFO' ? 'var(--accent-teal)' :
              insight.severity === 'CAUTION' ? 'var(--accent-amber)' : 'var(--accent-red)';
              
            return (
              <div key={insight.id} className={styles.insightCard} style={{ borderLeftColor: severityColor }}>
                <div className={styles.insightIcon}>{CAT_ICONS[insight.category]}</div>
                <div className={styles.insightContent}>
                  <h4 className={styles.insightTitle}>{insight.title}</h4>
                  <p className={styles.insightDesc}>{insight.description}</p>
                  <small>Importância: {insight.importance??'média'}</small>
                  <label style={{display:'block',marginTop:8}}><input type="checkbox" checked={knownTips.includes(insight.id)} onChange={()=>toggleTip(insight.id)}/> Já sei</label>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

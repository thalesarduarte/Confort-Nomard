import React, { useMemo, useState } from 'react';
import { LocationOverview } from '@/types';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './Modules.module.css';

export const LocationModule: React.FC<{ data: LocationOverview }> = ({ data }) => {
  const [sort, setSort] = useState<'cost'|'safety'>('cost');
  const neighborhoods = useMemo(()=>[...data.neighborhoods].sort((a,b)=>sort==='cost'?a.monthlyCost.total-b.monthlyCost.total:(b.safety??0)-(a.safety??0)),[data.neighborhoods,sort]);
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

      <Card className={styles.headerCard}>
        <h3 className={styles.subtitle}>Mapa ilustrativo de bairros</h3>
        <svg role="img" aria-label="Posição relativa dos bairros" viewBox="0 0 100 100" style={{width:'100%',maxHeight:220,background:'var(--surface-alt,#eef3f2)',borderRadius:12}}>
          {neighborhoods.map((nb,i)=><g key={nb.id}><circle cx={nb.x??(18+i*15)} cy={nb.y??40} r="4" fill={nb.isRecommended?'#168a72':'#ef9c52'}/><text x={(nb.x??(18+i*15))+2} y={(nb.y??40)-3} fontSize="3">{nb.name}</text></g>)}
        </svg>
        <label>Ordenar por <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="cost">Preço</option><option value="safety">Segurança</option></select></label>
      </Card>

      <div className={styles.grid2Col}>
        {neighborhoods.map(nb => {
          const maxCost = 3000; // arbitrary max for progress bars
          return (
            <Card key={nb.id} className={styles.nestedCard} glow={nb.isRecommended}>
              <div className={styles.cardHeaderFlex}>
                <h3 className={styles.cardTitle}>{nb.name}</h3>
                {nb.isRecommended && <Badge variant="success">Recomendado</Badge>}
              </div>
              
              <div className={styles.totalCost}>
                <span className={styles.costValue}>R$ {nb.monthlyCost.total.toLocaleString('pt-BR')}</span>
                <span className={styles.costLabel}>/mês</span>
              </div>
              <p>Segurança {nb.safety}/10 · transporte {nb.transit}/10 · encaixe no orçamento {nb.isRecommended?'verde':'vermelho'}</p>

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

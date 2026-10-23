import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { CulturalInsightCategory, InsightSeverity } from '@comfort-nomad/shared-types';

@Entity('cultural_insights')
export class CulturalInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cityId: string;

  @Column({ type: 'simple-enum', enum: CulturalInsightCategory })
  category: CulturalInsightCategory;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-enum', enum: InsightSeverity, default: InsightSeverity.INFO })
  severity: InsightSeverity;

  @Column({ default: 'CURATED' })
  sourceType: string;

  @Column({ type: 'int', default: 0 })
  upvotes: number;

  @Column({ type: 'int', default: 0 })
  downvotes: number;

  @ManyToOne(() => City, (city) => city.culturalInsights)
  @JoinColumn({ name: 'cityId' })
  city: City;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { CostOfLiving } from './cost-of-living.entity';
import { CostTier } from '@comfort-nomad/shared-types';

@Entity('neighborhoods')
export class Neighborhood {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cityId: string;

  @Column()
  name: string;

  @Column({ type: 'simple-enum', enum: CostTier })
  costTier: CostTier;

  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lng: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => City, (city) => city.neighborhoods)
  @JoinColumn({ name: 'cityId' })
  city: City;

  @OneToOne(() => CostOfLiving, (costOfLiving) => costOfLiving.neighborhood)
  costOfLiving: CostOfLiving;
}

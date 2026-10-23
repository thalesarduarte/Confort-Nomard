import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Neighborhood } from './neighborhood.entity';

@Entity('costs_of_living')
export class CostOfLiving {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  neighborhoodId: string;

  @Column({ type: 'float' })
  rentStudio: number;

  @Column({ type: 'float' })
  rentOneBedroom: number;

  @Column({ type: 'float' })
  groceriesMonthly: number;

  @Column({ type: 'float' })
  transportMonthly: number;

  @Column({ type: 'float' })
  diningOut: number;

  @Column({ type: 'float' })
  utilities: number;

  @Column({ type: 'float' })
  monthlyTotal: number;

  @Column({ default: 'BRL' }) // Or EUR
  currency: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Neighborhood, (neighborhood) => neighborhood.costOfLiving)
  @JoinColumn({ name: 'neighborhoodId' })
  neighborhood: Neighborhood;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { City } from './city.entity';

@Entity('climate_data')
@Unique(['cityId', 'month'])
export class ClimateData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cityId: string;

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column()
  monthName: string;

  @Column({ type: 'float' })
  avgTempMin: number;

  @Column({ type: 'float' })
  avgTempMax: number;

  @Column({ type: 'float' })
  avgHumidity: number;

  @Column({ type: 'int' })
  avgRainDays: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => City, (city) => city.climateData)
  @JoinColumn({ name: 'cityId' })
  city: City;
}

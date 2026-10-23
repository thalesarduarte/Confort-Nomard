import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Neighborhood } from './neighborhood.entity';
import { ClimateData } from './climate-data.entity';
import { FoodEstablishment } from './food-establishment.entity';
import { CulturalInsight } from './cultural-insight.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column()
  countryCode: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lng: number;

  @Column()
  timezone: string;

  @Column({ type: 'int', nullable: true })
  population: number;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => Neighborhood, (neighborhood) => neighborhood.city)
  neighborhoods: Neighborhood[];

  @OneToMany(() => ClimateData, (climate) => climate.city)
  climateData: ClimateData[];

  @OneToMany(() => FoodEstablishment, (food) => food.city)
  foodEstablishments: FoodEstablishment[];

  @OneToMany(() => CulturalInsight, (insight) => insight.city)
  culturalInsights: CulturalInsight[];
}

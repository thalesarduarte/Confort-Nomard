import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { City } from './city.entity';

@Entity('food_establishments')
export class FoodEstablishment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cityId: string;

  @Column()
  name: string;

  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lng: number;

  @Column('simple-array')
  categories: string[];

  @Column('simple-array')
  servesCuisines: string[];

  @Column('simple-array')
  comfortFoodTags: string[];

  @Column({ type: 'int' }) // 1-4
  priceRange: number;

  @Column({ default: false })
  verifiedOrigin: boolean;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => City, (city) => city.foodEstablishments)
  @JoinColumn({ name: 'cityId' })
  city: City;
}

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ThermalSensitivity, TravelPurpose } from '@comfort-nomad/shared-types';

@Entity('user_preference_profiles')
export class UserPreferenceProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'simple-enum', enum: ThermalSensitivity, default: ThermalSensitivity.TOLERANT })
  thermalSensitivity: ThermalSensitivity;

  @Column('simple-array', { nullable: true })
  comfortFoods: string[];

  @Column({ type: 'float', default: 2000 })
  monthlyBudget: number;

  @Column({ default: 'USD' })
  budgetCurrency: string;

  @Column({ type: 'int', default: 5 })
  culturalOpenness: number;

  @Column({ type: 'simple-enum', enum: TravelPurpose, default: TravelPurpose.DIGITAL_NOMAD })
  travelPurpose: TravelPurpose;

  @Column('simple-array', { default: 'pt' })
  languages: string[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}

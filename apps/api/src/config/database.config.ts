import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UserPreferenceProfile } from '../database/entities/user-preference-profile.entity';
import { City } from '../database/entities/city.entity';
import { Neighborhood } from '../database/entities/neighborhood.entity';
import { CostOfLiving } from '../database/entities/cost-of-living.entity';
import { ClimateData } from '../database/entities/climate-data.entity';
import { FoodEstablishment } from '../database/entities/food-establishment.entity';
import { CulturalInsight } from '../database/entities/cultural-insight.entity';

const entities = [
  User,
  UserPreferenceProfile,
  City,
  Neighborhood,
  CostOfLiving,
  ClimateData,
  FoodEstablishment,
  CulturalInsight,
];

// Use SQLite when USE_SQLITE=true or when no DB_HOST is configured
const useSQLite = process.env.USE_SQLITE === 'true' || !process.env.DB_HOST;

export default (): TypeOrmModuleOptions => {
  if (useSQLite) {
    const dbPath =
      process.env.NODE_ENV === 'production'
        ? '/data/comfort_nomad.sqlite'
        : 'comfort_nomad_demo.sqlite';
    console.log(`📦 Using SQLite (${dbPath})`);
    return {
      type: 'better-sqlite3',
      database: dbPath,
      entities,
      synchronize: true,
    } as TypeOrmModuleOptions;
  }

  console.log(`🐘 Connecting to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`);
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'comfort_nomad',
    entities,
    synchronize: process.env.NODE_ENV !== 'production',
  };
};

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import databaseConfig from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CitiesModule } from './modules/cities/cities.module';
import { ClimateModule } from './modules/climate/climate.module';
import { FoodModule } from './modules/food/food.module';
import { LocationModule } from './modules/location/location.module';
import { CultureModule } from './modules/culture/culture.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes in-memory cache
      max: 100,
    }),
    AuthModule,
    UsersModule,
    CitiesModule,
    ClimateModule,
    FoodModule,
    LocationModule,
    CultureModule,
    AiModule,
  ],
})
export class AppModule {}

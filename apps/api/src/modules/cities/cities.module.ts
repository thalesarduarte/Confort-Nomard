import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '../../database/entities/city.entity';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { ClimateModule } from '../climate/climate.module';
import { FoodModule } from '../food/food.module';
import { LocationModule } from '../location/location.module';
import { CultureModule } from '../culture/culture.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([City]),
    ClimateModule,
    FoodModule,
    LocationModule,
    CultureModule,
    UsersModule,
  ],
  providers: [CitiesService],
  controllers: [CitiesController],
})
export class CitiesModule {}

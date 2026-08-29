import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodEstablishment } from '../../database/entities/food-establishment.entity';
import { City } from '../../database/entities/city.entity';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FoodEstablishment, City])],
  providers: [FoodService],
  controllers: [FoodController],
  exports: [FoodService],
})
export class FoodModule {}

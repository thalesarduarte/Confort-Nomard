import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodEstablishment } from '../../database/entities/food-establishment.entity';
import { FoodService } from './food.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoodEstablishment])],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}

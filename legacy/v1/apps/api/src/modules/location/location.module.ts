import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Neighborhood } from '../../database/entities/neighborhood.entity';
import { CostOfLiving } from '../../database/entities/cost-of-living.entity';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([Neighborhood, CostOfLiving])],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}

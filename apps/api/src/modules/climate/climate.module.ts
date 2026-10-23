import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClimateData } from '../../database/entities/climate-data.entity';
import { City } from '../../database/entities/city.entity';
import { ClimateService } from './climate.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClimateData, City])],
  providers: [ClimateService],
  exports: [ClimateService],
})
export class ClimateModule {}

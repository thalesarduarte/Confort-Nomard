import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClimateData } from '../../database/entities/climate-data.entity';
import { ClimateService } from './climate.service';
import { ClimateController } from './climate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClimateData])],
  providers: [ClimateService],
  controllers: [ClimateController],
  exports: [ClimateService],
})
export class ClimateModule {}

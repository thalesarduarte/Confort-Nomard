import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CulturalInsight } from '../../database/entities/cultural-insight.entity';
import { CultureService } from './culture.service';

@Module({
  imports: [TypeOrmModule.forFeature([CulturalInsight])],
  providers: [CultureService],
  exports: [CultureService],
})
export class CultureModule {}

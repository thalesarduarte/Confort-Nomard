import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CulturalInsight } from '../../database/entities/cultural-insight.entity';
import { CultureService } from './culture.service';
import { CultureController } from './culture.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CulturalInsight])],
  providers: [CultureService],
  controllers: [CultureController],
  exports: [CultureService],
})
export class CultureModule {}

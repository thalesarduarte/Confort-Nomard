import { IsOptional, IsString, IsArray, IsNumber, IsObject } from 'class-validator';

export class RecommendDestinationsDto {
  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;

  @IsOptional()
  @IsArray()
  freeformTags?: string[];

  @IsOptional()
  @IsArray()
  priorityRanking?: string[];

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsNumber()
  maxItems?: number;
}

import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CityRecommendationsDto {
  @IsOptional()
  @IsObject()
  profile?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  freeformTags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxItems?: number;

  @IsOptional()
  @IsString()
  locale?: string;
}

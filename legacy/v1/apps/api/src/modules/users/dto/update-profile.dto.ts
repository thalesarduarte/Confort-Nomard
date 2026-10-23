import { IsOptional, IsString, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ThermalSensitivity, TravelPurpose } from '@comfort-nomad/shared-types';

export class UpdateProfileDto {
  @IsOptional()
  @IsEnum(ThermalSensitivity)
  thermalSensitivity?: ThermalSensitivity;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comfortFoods?: string[];

  @IsOptional()
  @IsNumber()
  monthlyBudget?: number;

  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @IsOptional()
  @IsNumber()
  culturalOpenness?: number;

  @IsOptional()
  @IsEnum(TravelPurpose)
  travelPurpose?: TravelPurpose;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

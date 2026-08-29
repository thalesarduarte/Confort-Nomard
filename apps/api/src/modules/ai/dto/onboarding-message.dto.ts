import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class OnboardingMessageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  history: MessageDto[];

  @IsOptional()
  @IsObject()
  profileSoFar?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  locale?: string;
}

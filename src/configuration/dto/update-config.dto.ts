
// src/configuration/dto/update-config.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateConfigDto {
  @IsNotEmpty()
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;
}

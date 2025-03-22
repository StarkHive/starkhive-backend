
// 37. Create Configuration DTOs
// src/configuration/dto/create-config.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConfigDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsString()
  description?: string;
}
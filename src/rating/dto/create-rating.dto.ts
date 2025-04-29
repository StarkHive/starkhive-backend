
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  ratedUserId: string;

  @IsNumber()
  ratingValue: number; // typically 1–5

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  raterUserId: string;
}

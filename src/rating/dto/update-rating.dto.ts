
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateRatingDto {
  @IsOptional()
  @IsNumber()
  ratingValue?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

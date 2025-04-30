import { IsArray, IsOptional, IsString, MaxLength, ArrayMaxSize } from 'class-validator';

export class CreateWatchlistDto {
  @IsString()
  recruiterId: string;

  @IsString()
  freelancerId: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tags?: string[];
}

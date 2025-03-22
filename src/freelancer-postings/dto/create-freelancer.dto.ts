import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateFreelancerDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString({ each: true })
  skills: string[];

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsString()
  @IsOptional()
  availability?: string; // Full-time, Part-time, etc.

  @IsString()
  @IsOptional()
  location?: string;
}

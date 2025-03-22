import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateCompanyPostingDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  industry: string;

  @IsOptional()
  @IsNumber()
  companySize?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsString()
  website?: string;
}

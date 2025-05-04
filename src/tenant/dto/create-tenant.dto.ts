import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsUrl, IsObject } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsString()
  schemaName?: string;

  @IsOptional()
  @IsString()
  databaseUrl?: string;

  @IsOptional()
  @IsBoolean()
  usesSeparateDatabase?: boolean;

  @IsOptional()
  @IsString()
  tablePrefix?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;
}
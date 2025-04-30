import { IsUUID, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FileDto {
  @IsString()
  filename: string;

  @IsString()
  path: string;

  @IsString()
  mimeType: string;
}

export class CreateProofOfWorkDto {
  @IsUUID()
  jobId: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  @IsOptional()
  files?: FileDto[];
}

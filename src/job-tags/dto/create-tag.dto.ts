import { IsNotEmpty, IsString, IsUUID, IsOptional, MaxLength } from "class-validator"

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string

  @IsNotEmpty()
  @IsUUID()
  jobId: string
}

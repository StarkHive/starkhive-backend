import { IsNotEmpty, IsUUID, IsOptional, IsString } from "class-validator"

export class CreateRecommendationRequestDto {
  @IsNotEmpty()
  @IsUUID()
  requesteeId: string

  @IsOptional()
  @IsString()
  message?: string
}


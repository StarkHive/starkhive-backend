import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsBoolean } from "class-validator"
import { RecommendationStatus } from "../enums/RecommendationStatus.enum"

export class CreateRecommendationDto {
  @IsNotEmpty()
  @IsUUID()
  recipientId: string

  @IsNotEmpty()
  content: string

  @IsOptional()
  @IsEnum(RecommendationStatus)
  status?: RecommendationStatus

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}


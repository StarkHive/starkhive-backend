import { IsOptional, IsEnum, IsString, IsBoolean } from "class-validator"
import { RecommendationStatus } from "../enums/RecommendationStatus.enum"

export class UpdateRecommendationDto {
  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsEnum(RecommendationStatus)
  status?: RecommendationStatus

  @IsOptional()
  @IsString()
  rejectionReason?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}


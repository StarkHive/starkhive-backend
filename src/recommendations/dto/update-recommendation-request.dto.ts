import { IsEnum, IsOptional } from "class-validator"
import { RequestStatus } from "../enums/RequestStatus.enum"

export class UpdateRecommendationRequestDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus
}


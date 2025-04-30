
import { IsString } from 'class-validator';

export class GetUserRatingsDto {
  @IsString()
  userId: string;
}

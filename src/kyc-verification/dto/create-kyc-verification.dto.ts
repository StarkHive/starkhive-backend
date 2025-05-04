import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
export class CreateKycVerificationDto {
    @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  documentType: string;
  
  // File will be handled by NestJS FileInterceptor

}

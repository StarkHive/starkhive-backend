import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../enums/user-role.enum";

// DTO for bulk user import
export class BulkUserImportDto {
    @IsString()
    @IsOptional()
    firstName?: string;
  
    @IsString()
    @IsOptional()
    lastName?: string;
  
    @IsEmail()
    email: string;
  
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.USER;
  
    @IsString()
    @IsOptional()
    department?: string;
  
    @IsString()
    @IsOptional()
    phoneNumber?: string;
  }
  
  // Import result DTO to track import status
  export class ImportResultDto {
    totalRecords: number;
    successfulImports: number;
    failedImports: number;
    errors: string[];
  }
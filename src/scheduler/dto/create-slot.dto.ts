import {
    IsNotEmpty,
    IsString,
    IsDateString,
    IsOptional,
    IsArray,
    IsEmail,
  } from 'class-validator';
  
  export class CreateSlotDto {
    @IsNotEmpty()
    @IsString()
    userId: string;
  
    @IsNotEmpty()
    @IsString()
    recruiterId: string;
  
    @IsNotEmpty()
    @IsString()
    title: string;
  
    @IsNotEmpty()
    @IsString()
    description: string;
  
    @IsNotEmpty()
    @IsDateString()
    startTime: string;
  
    @IsNotEmpty()
    @IsDateString()
    endTime: string;
  
    @IsNotEmpty()
    @IsString()
    timezone: string;
  
    @IsOptional()
    @IsString()
    location?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsEmail({}, { each: true })
    participants?: string[];
  }
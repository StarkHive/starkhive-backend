import { TimeEntry } from '../../time-tracking/entities/time-entry.entity';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class GenerateInvoiceDto {
  @IsNotEmpty()
  timeEntry: TimeEntry;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsUUID()
  @IsNotEmpty()
  freelancerId: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

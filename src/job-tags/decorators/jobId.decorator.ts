import { IsUUID } from 'class-validator';

export class JobIdDto {
  @IsUUID()
  jobId: string;
}

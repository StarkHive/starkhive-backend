import { PartialType } from '@nestjs/swagger';
import { CreateAnalyticsEventDto } from './create-job-analytic.dto';

export class UpdateJobAnalyticDto extends PartialType(CreateAnalyticsEventDto) {}

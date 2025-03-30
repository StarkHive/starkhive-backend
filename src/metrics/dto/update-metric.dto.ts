import { PartialType } from '@nestjs/swagger';
import { CreateMetricDto } from './create-metric.dto';

export class UpdateMetricDto extends PartialType(CreateMetricDto) {}

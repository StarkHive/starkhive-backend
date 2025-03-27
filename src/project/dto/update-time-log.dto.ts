import { PartialType } from '@nestjs/mapped-types';
import { CreateTimeLogDto } from './create-time-log.dto';

export class UpdateTimeLogDto extends PartialType(CreateTimeLogDto) {} 
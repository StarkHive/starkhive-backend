import { PartialType } from '@nestjs/swagger';
import { CreateRecruiterDto } from './create-recruiter.dto';

export class UpdateRecruiterDto extends PartialType(CreateRecruiterDto) {}

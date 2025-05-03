import { PartialType } from '@nestjs/swagger';
import { CreateReputationAppealDto } from './create-reputation-appeal.dto';

export class UpdateReputationAppealDto extends PartialType(CreateReputationAppealDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateReferralDto } from './create-referral-program.dto';

export class UpdateReferralDto extends PartialType(CreateReferralDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateProofOfWorkDto } from './create-proof-of-work.dto';

export class UpdateProofOfWorkDto extends PartialType(CreateProofOfWorkDto) {}

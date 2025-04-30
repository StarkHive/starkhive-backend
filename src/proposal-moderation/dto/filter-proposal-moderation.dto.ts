import { IsEnum, IsOptional } from 'class-validator';
import { ProposalStatus } from '../enums/proposal-status.enum';

export class FilterProposalDto {
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;
}

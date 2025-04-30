import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProposalStatus } from '../enums/proposal-status.enum';

export class UpdateProposalDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;
}

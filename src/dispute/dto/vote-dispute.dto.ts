import { IsEnum, IsString, IsOptional } from 'class-validator';
import { VoteDecision } from '../entities/dispute-vote.entity';

export class VoteDisputeDto {
  @IsEnum(VoteDecision)
  decision: VoteDecision;

  @IsString()
  @IsOptional()
  reasoning?: string;
} 
import { IsEnum, IsNotEmpty } from 'class-validator';
import { VoteType } from '../enums/voteType.enum';

export class VoteTagDto {
  @IsNotEmpty()
  @IsEnum(VoteType)
  voteType: VoteType;
}

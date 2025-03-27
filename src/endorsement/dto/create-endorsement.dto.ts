import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateEndorsementDto {
  @IsNotEmpty()
  @IsInt()
  endorserId: number; 

  @IsNotEmpty()
  @IsInt()
  endorsedProfileId: number; 

  @IsNotEmpty()
  @IsString()
  skill: string;
}

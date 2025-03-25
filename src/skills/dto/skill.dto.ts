import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSkillDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddUserSkillDto {
  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  proficiencyLevel: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateUserSkillDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  proficiencyLevel?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateSkillCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;
}

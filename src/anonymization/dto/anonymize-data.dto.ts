import { IsObject, IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class AnonymizeDataDto {
  @IsObject()
  data: Record<string, any>;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  fieldsToAnonymize: string[];
}

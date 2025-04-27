import { IsObject, IsOptional, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class RichTextContentDto {
  @IsString()
  type: string

  @IsOptional()
  @IsObject()
  attrs?: Record<string, any>

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RichTextContentDto)
  content?: RichTextContentDto[]

  @IsOptional()
  @IsString()
  text?: string
}


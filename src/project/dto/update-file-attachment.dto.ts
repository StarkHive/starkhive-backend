import { PartialType } from '@nestjs/mapped-types';
import { CreateFileAttachmentDto } from './create-file-attachment.dto';

export class UpdateFileAttachmentDto extends PartialType(CreateFileAttachmentDto) {} 
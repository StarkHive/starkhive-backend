import { PartialType } from '@nestjs/swagger';
import { CreateSseDto } from './create-sse.dto';

export class UpdateSseDto extends PartialType(CreateSseDto) {}

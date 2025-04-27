import { PartialType } from '@nestjs/swagger';
import { CreateUserSessionDto } from './create-user-session.dto';

export class UpdateUserSessionDto extends PartialType(CreateUserSessionDto) {}

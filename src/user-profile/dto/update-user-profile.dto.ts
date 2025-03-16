import { PartialType } from '@nestjs/mapped-types';
import { CreateUserProfileDto } from './create-user-profile.dto';


export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) {
}


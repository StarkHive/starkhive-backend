import { PartialType } from '@nestjs/mapped-types';
import { CreateFreelancerProfileDto } from './create-freelancer-profile.dto';

export class UpdateFreelancerProfileDto extends PartialType(CreateFreelancerProfileDto) {}

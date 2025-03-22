import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyPostingDto } from './create-company-posting.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyPostingDto) {}

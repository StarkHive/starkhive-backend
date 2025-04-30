import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AnonymizationService } from '../services/anonymization.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AnonymizeDataDto } from '../dto/anonymize-data.dto';
import { Role } from '@src/auth/enums/role.enum';

@Controller('anonymization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnonymizationController {
  constructor(private readonly anonymizationService: AnonymizationService) {}

  @Post('anonymize-data')
  @Roles(Role.ADMIN)
  async anonymizeData(@Body() dto: AnonymizeDataDto) {
    const { data, fieldsToAnonymize } = dto;
    const result = await this.anonymizationService.anonymizeFields(data, fieldsToAnonymize);
    return { message: 'Data anonymized successfully', result };
  }
}

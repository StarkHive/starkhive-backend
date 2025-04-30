import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AnonymizationService } from '../services/anonymization.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@Controller('anonymization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnonymizationController {
  constructor(private readonly anonymizationService: AnonymizationService) {}

  @Post('anonymize-data')
  // @Roles(Role.ADMIN)
  async anonymizeData(
    @Body() body: { data: Record<string, any>; fieldsToAnonymize: string[] },
  ) {
    const { data, fieldsToAnonymize } = body;
    return this.anonymizationService.anonymizeFields(data, fieldsToAnonymize);
  }
}

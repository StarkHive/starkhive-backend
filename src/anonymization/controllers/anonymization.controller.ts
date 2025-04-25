import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AnonymizationService } from '../services/anonymization.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';
// import { Role } from '../../auth/enums/role.enum';

@Controller('anonymization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnonymizationController {
  constructor(private readonly anonymizationService: AnonymizationService) {}

  @Post('anonymize-data')
  @Roles(Role.ADMIN)
  async anonymizeData(
    @Body() data: Record<string, any>,
    @Body('fieldsToAnonymize') fieldsToAnonymize: string[],
  ) {
    return this.anonymizationService.anonymizeFields(data, fieldsToAnonymize);
  }
}

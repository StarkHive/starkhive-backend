import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProposalModerationService } from './proposal-moderation.service';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { FilterProposalDto } from './dto/filter-proposal-moderation.dto';
import { UpdateProposalDto } from './dto/update-proposal-moderation.dto';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { Role } from '@src/auth/enums/role.enum';

@UseGuards(RolesGuard)
@Controller('moderation/proposals')
export class ProposalModerationController {
  constructor(private readonly service: ProposalModerationService) {}

  @Get()
  findAll(@Query() filterDto: FilterProposalDto) {
    return this.service.findAll(filterDto.status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProposalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
  ParseEnumPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ErrorTrackingService } from './error-tracking.service';
import { ErrorSeverity } from './entities/error-log.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Error Tracking')
@Controller('error-tracking')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class ErrorTrackingController {
  constructor(private readonly errorTrackingService: ErrorTrackingService) {}

  @Get()
  @ApiOperation({ summary: 'Get error logs with filters' })
  @ApiQuery({ name: 'severity', enum: ErrorSeverity, required: false })
  @ApiQuery({ name: 'startDate', type: Date, required: false })
  @ApiQuery({ name: 'endDate', type: Date, required: false })
  @ApiQuery({ name: 'userId', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getErrorLogs(
    @Query('severity', new ParseEnumPipe(ErrorSeverity, { optional: true }))
    severity?: ErrorSeverity,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('userId', new ParseUUIDPipe({ optional: true })) userId?: string,
    @Query('page', ValidationPipe) page?: number,
    @Query('limit', ValidationPipe) limit?: number,
  ) {
    return this.errorTrackingService.getErrorLogs({
      severity,
      startDate,
      endDate,
      userId,
      page,
      limit,
    });
  }
}

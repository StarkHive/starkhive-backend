import { Controller, Post, Get, Body, Param, UseGuards, Query, Res, StreamableFile } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { Role } from '../auth/roles.enum';
import { Buffer } from 'buffer';
import { StartTrackingDto } from './dto/start-tracking.dto';

@Controller('time-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post('entries')
  @Roles(Role.FREELANCER)
  async createTimeEntry(
    @CurrentUser() user: User,
    @Body() createTimeEntryDto: CreateTimeEntryDto,
  ) {
    return this.timeTrackingService.createTimeEntry(user, createTimeEntryDto);
  }

  @Get('entries/freelancer')
  @Roles(Role.FREELANCER)
  async getMyTimeEntries(@CurrentUser() user: User) {
    return this.timeTrackingService.getFreelancerTimeEntries(user.id);
  }

  @Get('entries/project/:projectId')
  @Roles(Role.COMPANY, Role.ADMIN)
  async getProjectTimeEntries(@Param('projectId') projectId: string) {
    return this.timeTrackingService.getProjectTimeEntries(projectId);
  }

  @Post('entries/:id/approve')
  @Roles(Role.COMPANY, Role.ADMIN)
  async approveTimeEntry(
    @Param('id') timeEntryId: string,
    @CurrentUser() user: User,
  ) {
    return this.timeTrackingService.approveTimeEntry(timeEntryId, user.id);
  }

  @Get('report')
  @Roles(Role.FREELANCER, Role.COMPANY, Role.ADMIN)
  async generateReport(
    @Query('freelancerId') freelancerId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.timeTrackingService.generateReport(freelancerId, startDate, endDate);
  }

  @Get('export/csv')
  @Roles(Role.FREELANCER, Role.COMPANY, Role.ADMIN)
  async exportToCSV(
    @Query('freelancerId') freelancerId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Res({ passthrough: true }) res: any
  ) {
    const csv = await this.timeTrackingService.exportToCSV(freelancerId, startDate, endDate);
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=time-entries.csv'
    });
    return new StreamableFile(Buffer.from(csv));
  }

  @Get('export/pdf')
  @Roles(Role.FREELANCER, Role.COMPANY, Role.ADMIN)
  async exportToPDF(
    @Query('freelancerId') freelancerId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Res({ passthrough: true }) res: any
  ) {
    const pdf = await this.timeTrackingService.exportToPDF(freelancerId, startDate, endDate);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=time-entries.pdf'
    });
    return new StreamableFile(pdf);
  }

  @Post('tracking/start')
  @Roles(Role.FREELANCER)
  async startTracking(
    @CurrentUser() user: User,
    @Body() startTrackingDto: StartTrackingDto,
  ) {
    return this.timeTrackingService.startTracking(user, startTrackingDto);
  }

  @Post('tracking/stop')
  @Roles(Role.FREELANCER)
  async stopTracking(@CurrentUser() user: User) {
    return this.timeTrackingService.stopTracking(user.id);
  }

  @Get('tracking/active')
  @Roles(Role.FREELANCER)
  async getActiveTracking(@CurrentUser() user: User) {
    return this.timeTrackingService.getActiveTracking(user.id);
  }
}

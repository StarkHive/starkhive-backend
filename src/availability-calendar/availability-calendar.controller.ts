import { SetAvailabilityDto } from './dto/set-availability.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request as ReqDecorator,
} from '@nestjs/common';
import { AvailabilityCalendarService } from './availability-calendar.service';
import { Request as ExpressRequest } from 'express';

@Controller('availability-calendar')
export class AvailabilityCalendarController {
  constructor(
    private readonly availabilityService: AvailabilityCalendarService
  ) {}

  @Post()
  async setAvailability(
    @ReqDecorator() req: ExpressRequest,
    @Body() body: SetAvailabilityDto
  ) {
    const userId = Number(req.user?.id);
    return this.availabilityService.setAvailability(userId, body.entries);
  }

  @Get('me')
  async getMyAvailability(@ReqDecorator() req: ExpressRequest) {
    const userId = Number(req.user?.id);
    return this.availabilityService.getAvailability(userId);
  }

  @Get('search')
  async searchAvailability(
    @Query('day') day: string,
    @Query('time') time: string,
  ) {
    return this.availabilityService.findAvailableFreelancers(day, time);
  }
}

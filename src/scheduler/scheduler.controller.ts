import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    Res,
    HttpStatus,
    BadRequestException,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { SchedulerService } from './scheduler.service';
  import { CreateSlotDto } from './dto/create-slot.dto';
  import { UpdateSlotDto } from './dto/update-slot.dto';
  import { SlotQueryDto } from './dto/slot-query.dto';
  
  @Controller('scheduler/slots')
  export class SchedulerController {
    constructor(private readonly schedulerService: SchedulerService) {}
  
    @Post()
    async createSlot(@Body() createSlotDto: CreateSlotDto) {
      try {
        return await this.schedulerService.createSlot(createSlotDto);
      } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestException(error.message);
        }
        throw new BadRequestException('Unknown error occurred');
      }
    }
  
    @Get(':userId')
    async getSlots(
      @Param('userId') userId: string,
      @Query() query: SlotQueryDto,
    ) {
      return this.schedulerService.getSlotsForUser(userId, query);
    }
  
    @Patch(':id')
    async updateSlot(
      @Param('id') id: string,
      @Body() updateSlotDto: UpdateSlotDto,
    ) {
      try {
        return await this.schedulerService.updateSlot(id, updateSlotDto);
      } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestException(error.message);
        }
        throw new BadRequestException('Unknown error occurred');
      }
    }
  
    @Delete(':id')
    async deleteSlot(@Param('id') id: string) {
      return this.schedulerService.deleteSlot(id);
    }
  
    @Get(':id/export')
    async exportSlotToIcs(
      @Param('id') id: string,
      @Res() res: Response,
    ) {
      try {
        const icsData = await this.schedulerService.generateIcsForSlot(id);
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename=interview-slot-${id}.ics`);
        return res.status(HttpStatus.OK).send(icsData);
      } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestException(error.message);
        }
        throw new BadRequestException('Failed to generate ICS file');
      }
    }
  }
  
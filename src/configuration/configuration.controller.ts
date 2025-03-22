import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express'; // Import the Request type
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AuditService } from '../audit/audit.service';
import { CreateConfigDto } from './dto/configuration.dto';

@Controller('configuration')
// @UseGuards(JwtAuthGuard, AdminGuard)
export class ConfigurationController {
  constructor(
    private readonly configService: ConfigurationService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(@Body() createConfigDto: CreateConfigDto, @Req() req: Request) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const result = await this.configService.create(createConfigDto, userId);
    
    await this.auditService.createLog({
      action: 'config_created',
      resourceType: 'system_config',
      resourceId: result.id,
      userId: userId,
      ipAddress: req.ip,
      details: { key: createConfigDto.key },
    });
    
    return result;
  }

  @Get()
  findAll() {
    return this.configService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.configService.findOne(key);
  }

  @Patch(':key')
  async update(
    @Param('key') key: string, 
    @Body() updateConfigDto: UpdateConfigDto,
    @Req() req: Request
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const result = await this.configService.update(key, updateConfigDto, userId);
    
    await this.auditService.createLog({
      action: 'config_updated',
      resourceType: 'system_config',
      resourceId: result.id,
      userId: userId,
      ipAddress: req.ip,
      details: { key, newValue: updateConfigDto.value },
    });
    
    return result;
  }

  @Delete(':key')
  async remove(@Param('key') key: string, @Req() req: Request) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const config = await this.configService.findOne(key);
    await this.configService.remove(key);
    
    await this.auditService.createLog({
      action: 'config_deleted',
      resourceType: 'system_config',
      resourceId: config.id,
      userId: userId,
      ipAddress: req.ip,
      details: { key },
    });
    
    return { success: true };
  }
}
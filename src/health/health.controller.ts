
// 46. Create HealthController (src/health/health.controller.ts)
import { Controller, Get, } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }

  @Get('database')
//   @UseGuards(JwtAuthGuard, AdminGuard)
  checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Get('system')
//   @UseGuards(JwtAuthGuard, AdminGuard)
  getSystemInfo() {
    return this.healthService.getSystemInfo();
  }
}

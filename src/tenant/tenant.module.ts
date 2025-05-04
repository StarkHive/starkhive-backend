import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './entities/tenant.entity';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { APP_GUARD } from '@nestjs/core';
import { TenantGuard } from './guards/tenant.guard';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    ConfigModule,
  ],
  controllers: [TenantController],
  providers: [
    TenantService,
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
  exports: [TenantService],
})
export class TenantModule {}

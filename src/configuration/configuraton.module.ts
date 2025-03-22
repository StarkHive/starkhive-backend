
// 36. Create ConfigurationModule (src/configuration/configuration.module.ts)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { AuditModule } from '../audit/audit.module';
import { SystemConfig } from './enitities/system-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig]),
    AuditModule,
  ],
  providers: [ConfigurationService],
  controllers: [ConfigurationController],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}

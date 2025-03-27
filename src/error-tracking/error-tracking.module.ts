import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLog } from './entities/error-log.entity';
import { ErrorTrackingService } from './error-tracking.service';
import { ErrorTrackingController } from './error-tracking.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorLog]),
    ConfigModule, // Required for ConfigService
  ],
  providers: [ErrorTrackingService],
  controllers: [ErrorTrackingController],
  exports: [ErrorTrackingService],
})
export class ErrorTrackingModule {}

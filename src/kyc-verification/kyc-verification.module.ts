import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { KycVerificationController } from './kyc-verification.controller';
import { KycVerificationService } from './kyc-verification.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import kycConfig from '@src/config/kyc.config';
import { KycDocument } from './entities/kyc-verification.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([KycDocument]),
    ConfigModule.forFeature(kycConfig),
    MulterModule.register({
      storage: memoryStorage(), // Store in memory for encryption processing
    }),
  ],
  controllers: [KycVerificationController],
  providers: [KycVerificationService],
  exports: [KycVerificationService],
})
export class KycVerificationModule {}
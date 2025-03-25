import { Module } from '@nestjs/common';
import { ReputationController } from './reputation.controller';
import { ReputationService } from './provider/reputation.service';

@Module({
  controllers: [ReputationController],
  providers: [ReputationService]
})
export class ReputationModule {}

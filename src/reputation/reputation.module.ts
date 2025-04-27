import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReputationController } from './reputation.controller';
import { ReputationService } from './provider/reputation.service';
import { Reputation } from './Reputation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reputation])], // Register Reputation entity
  controllers: [ReputationController],
  providers: [ReputationService],
  exports: [TypeOrmModule], // Export for use in other modules
})
export class ReputationModule {}

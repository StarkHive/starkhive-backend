import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModerationService } from './proposal-moderation.service';
import { ProposalModerationController } from './proposal-moderation.controller';
import { Proposal } from './entities/proposal-moderation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal])],
  controllers: [ProposalModerationController],
  providers: [ProposalModerationService],
})
export class ProposalModerationModule {}

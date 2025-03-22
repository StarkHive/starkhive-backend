import { Module } from '@nestjs/common';
import { ReputationService } from './provider/reputation.service';
import { ReputationRepository } from './Reputation Repository';
import { BlockchainService } from 'src/blockchain/BlockchainService'; 
import { BlockchainEventListener } from 'src/blockchain/BlockchainEventListener';

@Module({
  providers: [
    ReputationService, 
    ReputationRepository,
    BlockchainService, 
    BlockchainEventListener,
  ],
})
export class ReputationModule {}

import { Injectable, Logger } from '@nestjs/common';
import { ReputationRepository } from '@src/reputation/ReputationRepository';

@Injectable()
export class BlockchainEventListener {
  private readonly logger = new Logger(BlockchainEventListener.name);

  constructor(private readonly reputationRepository: ReputationRepository) {}

  async handleBlockchainEvent(event: any) {
    this.logger.log(`Received blockchain event: ${JSON.stringify(event)}`);

    const { userId, rating, eventType } = event;

    switch (eventType) {
      case 'JOB_COMPLETED':
        await this.reputationRepository.updateReputation(userId, rating);
        break;
      case 'USER_VERIFIED':
        await this.reputationRepository.verifyUser(userId);
        break;
      default:
        this.logger.warn(`Unhandled event type: ${eventType}`);
    }
  }
}

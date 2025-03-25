import { Injectable, OnModuleInit } from '@nestjs/common';
import { BlockchainEventListener } from '../BlockchainEventListener';

@Injectable()
export class BlockchainService implements OnModuleInit {
  constructor(private readonly eventListener: BlockchainEventListener) {}

  async onModuleInit() {
    // Simulating blockchain event listening
    setInterval(() => {
      const mockEvent = {
        userId: Math.floor(Math.random() * 100),
        rating: Math.random() * 5,
        eventType: 'JOB_COMPLETED',
      };
      this.eventListener.handleBlockchainEvent(mockEvent);
    }, 10000);
  }
}

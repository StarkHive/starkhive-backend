import { Module } from '@nestjs/common';
import { RatingsService } from './rating.service';

@Module({
  providers: [RatingsService],
  exports: [RatingsService], // Important! We will inject it elsewhere
})
export class RatingsModule {}

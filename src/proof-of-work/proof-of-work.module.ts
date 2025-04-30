import { Module } from '@nestjs/common';
import { ProofOfWorkService } from './proof-of-work.service';
import { ProofOfWorkController } from './proof-of-work.controller';

@Module({
  controllers: [ProofOfWorkController],
  providers: [ProofOfWorkService],
})
export class ProofOfWorkModule {}

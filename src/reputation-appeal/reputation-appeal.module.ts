import { Module } from '@nestjs/common';
import { ReputationAppealService } from './reputation-appeal/reputation-appeal.service';
import { ReputationAppealController } from './reputation-appeal/reputation-appeal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReputationAppeal } from './entities/reputation-appeal.entity';
import { UserModule } from '@src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReputationAppeal]),
    UserModule,
    TransactionsModule,
  ],
  controllers: [ReputationAppealController],
  providers: [ReputationAppealService],
})
export class ReputationAppealModule {}


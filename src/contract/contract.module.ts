import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { ContractRepository } from './repositories/contract.repository';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, ContractRepository])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService], 
})
export class ContractModule {}
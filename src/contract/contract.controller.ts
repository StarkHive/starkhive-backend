import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CacheService } from "@src/cache/cache.service";

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService, private cacheManager: CacheService) {}

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @Get()
  async findAll() {
    const cachedContracts = await this.cacheManager.get(`contracts:all`, 'ContractService');
    if (cachedContracts) {
      return cachedContracts;
    }
    const contracts = await this.contractService.findAll();
    await this.cacheManager.set(`contracts:all`, contracts);
    return contracts;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cachedContract = await this.cacheManager.get(`contracts:${id}`, 'ContractService');
    if (cachedContract) {
      return cachedContract;
    }
    const contract = await this.contractService.findOne(+id);
    await this.cacheManager.set(`contracts:${id}`, contract);
    return contract;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    await this.cacheManager.del(`contracts:${id}`);
    return this.contractService.update(+id, updateContractDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheManager.del(`contracts:${id}`);
    return this.contractService.remove(+id);
  }
}

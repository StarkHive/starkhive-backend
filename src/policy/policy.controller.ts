import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dtos/create-policy.dto';
import { UpdatePolicyDto } from './dtos/update-policy.dto';
import { CacheService } from "@src/cache/cache.service";

@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService, private cacheManager: CacheService) {}

  @Post()
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policyService.create(createPolicyDto);
  }

  @Get()
  async findAll() {
    const cachedPolicies = await this.cacheManager.get(`policies:all`, 'PolicyService');
    if (cachedPolicies) {
      return cachedPolicies;
    }

    const policies = await this.policyService.findAll();
    await this.cacheManager.set(`policies:all`, policies);
    return policies;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cachedPolicy = await this.cacheManager.get(`policies:${id}`, 'PolicyService');
    if (cachedPolicy) {
      return cachedPolicy;
    }
    const policy = await this.policyService.findOne(id);
    await this.cacheManager.set(`policies:${id}`, policy);
    return policy;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
    await this.cacheManager.del(`policies:${id}`);
    return this.policyService.update(id, updatePolicyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.cacheManager.del(`policies:${id}`);
    return this.policyService.remove(id);
  }

  @Post(':id/activate')
  async activatePolicy(@Param('id') id: string) {
    await this.cacheManager.del(`policies:${id}`);
    return this.policyService.activatePolicy(id);
  }

  @Post(':id/archive')
  async archivePolicy(@Param('id') id: string) {
    await this.cacheManager.del(`policies:${id}`);
    return this.policyService.archivePolicy(id);
  }
}

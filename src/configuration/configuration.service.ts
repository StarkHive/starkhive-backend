
// 38. Create ConfigurationService (src/configuration/configuration.service.ts)
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CreateConfigDto } from './dto/configuration.dto';
import { SystemConfig } from './enitities/system-config.entity';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  async create(createConfigDto: CreateConfigDto, userId: string): Promise<SystemConfig> {
    const existingConfig = await this.configRepository.findOne({
      where: { key: createConfigDto.key }
    });
    
    if (existingConfig) {
      throw new ConflictException(`Configuration with key "${createConfigDto.key}" already exists`);
    }
    
    const config = this.configRepository.create({
      ...createConfigDto,
      updatedById: userId,
    });
    
    return this.configRepository.save(config);
  }

  async findAll(): Promise<SystemConfig[]> {
    return this.configRepository.find({
      order: { key: 'ASC' },
    });
  }

  async findOne(key: string): Promise<SystemConfig> {
    const config = await this.configRepository.findOne({ where: { key } });
    
    if (!config) {
      throw new NotFoundException(`Configuration with key "${key}" not found`);
    }
    
    return config;
  }

  async update(key: string, updateConfigDto: UpdateConfigDto, userId: string): Promise<SystemConfig> {
    const config = await this.findOne(key);
    
    await this.configRepository.update(config.id, {
      ...updateConfigDto,
      updatedById: userId,
    });
    
    return this.findOne(key);
  }

  async remove(key: string): Promise<void> {
    const config = await this.findOne(key);
    await this.configRepository.remove(config);
  }
  async getValue(key: string, defaultValue: string = ''): Promise<string> {
    try {
      const config = await this.findOne(key);
      return config.value;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return defaultValue; // Ensure defaultValue is a string
      }
      throw error;
    }
  }
}
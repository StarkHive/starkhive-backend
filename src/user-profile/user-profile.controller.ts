import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfile } from './entities/user-profile.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CacheService } from "@src/cache/cache.service";

@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService, private cacheManager: CacheService) {}

  @Post()
  create(
    @Body() createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    return this.userProfileService.create(createUserProfileDto);
  }

  @Get()
  async findAll(): Promise<UserProfile[]> {
    const cachedUserProfiles = await this.cacheManager.get(`user-profiles:all`, 'UserProfileService');
    if (cachedUserProfiles) {
      return cachedUserProfiles;
    }
    const userProfiles = await this.userProfileService.findAll();
    await this.cacheManager.set(`user-profiles:all`, userProfiles);
    return userProfiles;
    //get request to /user-profiless
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserProfile> {
    const cachedUserProfile = await this.cacheManager.get(`user-profiles:${id}`, 'UserProfileService');
    if (cachedUserProfile) {
      return cachedUserProfile;
    }
    const userProfile = await this.userProfileService.findOne(id);
    await this.cacheManager.set(`user-profiles:${id}`, userProfile);
    return userProfile;
  }

  @Get('wallet/:address')
  findByWalletAddress(
    @Param('address') walletAddress: string,
  ): Promise<UserProfile> {
    return this.userProfileService.findByWalletAddress(walletAddress);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    await this.cacheManager.del(`user-profiles:${id}`);
    return this.userProfileService.update(id, updateUserProfileDto);
  }

  @Patch(':id/reputation')
  async updateReputationScore(
    @Param('id', ParseIntPipe) id: number,
    @Body('reputationScore', ParseIntPipe) reputationScore: number,
  ): Promise<UserProfile> {
    await this.cacheManager.del(`user-profiles:${id}`);
    return this.userProfileService.updateReputationScore(id, reputationScore);
  }

  @Patch(':id/skills')
  async addSkill(
    @Param('id', ParseIntPipe) id: number,
    @Body('skill') skill: string,
  ): Promise<UserProfile> {
    await this.cacheManager.del(`user-profiles:${id}`);
    return this.userProfileService.addSkill(id, skill);
  }

  @Patch(':id/work-history')
  async addWorkHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body('workItem') workItem: string,
  ): Promise<UserProfile> {
    await this.cacheManager.del(`user-profiles:${id}`);
    return this.userProfileService.addWorkHistory(id, workItem);
  }

  @Patch(':id/status')
  async setActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ): Promise<UserProfile> {
    await this.cacheManager.del(`user-profiles:${id}`);
    return this.userProfileService.setActiveStatus(id, isActive);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.cacheManager.del(`user-profiles:${id}`);
    return this.userProfileService.remove(id);
  }
}

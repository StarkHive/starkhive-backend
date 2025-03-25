import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfile } from './entities/user-profile.entity';

@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  create(
    @Body() createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    return this.userProfileService.create(createUserProfileDto);
  }

  @Get()
  findAll(): Promise<UserProfile[]> {
    return this.userProfileService.findAll();
    //get request to /user-profiless
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserProfile> {
    return this.userProfileService.findOne(id);
  }

  @Get('wallet/:address')
  findByWalletAddress(
    @Param('address') walletAddress: string,
  ): Promise<UserProfile> {
    return this.userProfileService.findByWalletAddress(walletAddress);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    return this.userProfileService.update(id, updateUserProfileDto);
  }

  @Patch(':id/reputation')
  updateReputationScore(
    @Param('id', ParseIntPipe) id: number,
    @Body('reputationScore', ParseIntPipe) reputationScore: number,
  ): Promise<UserProfile> {
    return this.userProfileService.updateReputationScore(id, reputationScore);
  }

  @Patch(':id/skills')
  addSkill(
    @Param('id', ParseIntPipe) id: number,
    @Body('skill') skill: string,
  ): Promise<UserProfile> {
    return this.userProfileService.addSkill(id, skill);
  }

  @Patch(':id/work-history')
  addWorkHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body('workItem') workItem: string,
  ): Promise<UserProfile> {
    return this.userProfileService.addWorkHistory(id, workItem);
  }

  @Patch(':id/status')
  setActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ): Promise<UserProfile> {
    return this.userProfileService.setActiveStatus(id, isActive);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userProfileService.remove(id);
  }
}

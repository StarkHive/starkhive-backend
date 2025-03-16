import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  async findAll(): Promise<UserProfile[]> {
    return this.userProfileRepository.find();
  }

  async findOne(id: number): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findOneBy({ id });
    if (!userProfile) {
      throw new NotFoundException(`User Profile with ID ${id} not found`);
    }
    return userProfile;
  }

  async findByWalletAddress(walletAddress: string): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findOneBy({
      walletAddress,
    });
    if (!userProfile) {
      throw new NotFoundException(
        `User Profile with wallet address ${walletAddress} not found`,
      );
    }
    return userProfile;
  }

  async create(
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    const userProfile = this.userProfileRepository.create(createUserProfileDto);
    return this.userProfileRepository.save(userProfile);
  }

  async update(
    id: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const userProfile = await this.findOne(id);
    const updatedUserProfile = Object.assign(userProfile, updateUserProfileDto);
    return this.userProfileRepository.save(updatedUserProfile);
  }

  async updateReputationScore(
    id: number,
    reputationScore: number,
  ): Promise<UserProfile> {
    const userProfile = await this.findOne(id);
    userProfile.reputationScore = reputationScore;
    return this.userProfileRepository.save(userProfile);
  }

  async addSkill(id: number, skill: string): Promise<UserProfile> {
    const userProfile = await this.findOne(id);
    if (!userProfile.skills.includes(skill)) {
      userProfile.skills.push(skill);
      return this.userProfileRepository.save(userProfile);
    }
    return userProfile;
  }

  async addWorkHistory(id: number, workItem: string): Promise<UserProfile> {
    const userProfile = await this.findOne(id);
    userProfile.workHistory.push(workItem);
    return this.userProfileRepository.save(userProfile);
  }

  async setActiveStatus(id: number, isActive: boolean): Promise<UserProfile> {
    const userProfile = await this.findOne(id);
    userProfile.isActive = isActive;
    return this.userProfileRepository.save(userProfile);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userProfileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User Profile with ID ${id} not found`);
    }
  }
}

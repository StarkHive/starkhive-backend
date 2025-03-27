import { Injectable } from '@nestjs/common';
import { FreelancerProfileRepository } from './repositories/freelancer-profile.repository';
import { CreateFreelancerProfileDto } from './dto/create-freelancer-profile.dto';
import { SearchFreelancerProfileDto } from './dto/search-freelancer-profile.dto';

@Injectable()
export class FreelancerProfileService {
  constructor(
    private readonly freelancerProfileRepository: FreelancerProfileRepository,
  ) {}

  // Create a new profile
  async createProfile(createFreelancerProfileDto: CreateFreelancerProfileDto) {
    return this.freelancerProfileRepository.createFreelancerProfile(
      createFreelancerProfileDto,
    );
  }

  // Get all freelancer profiles
  async findAll() {
    return this.freelancerProfileRepository.findAll(); // Now properly calls the findAll method
  }

  // Get profile by user ID
  async getProfileByUserId(userId: string) {
    return this.freelancerProfileRepository.findProfileByUserId(userId);
  }

  // Update skills
  async updateSkills(id: string, skills: string[]) {
    return this.freelancerProfileRepository.updateSkills(id, skills);
  }

  // Update experience
  async updateExperience(id: string, experience: string) {
    return this.freelancerProfileRepository.updateExperience(id, experience);
  }

  // Delete profile
  async deleteProfile(id: string) {
    return this.freelancerProfileRepository.deleteProfile(id);
  }

  // Search profiles
  async searchProfiles(searchParams: SearchFreelancerProfileDto) {
    return this.freelancerProfileRepository.searchProfiles(searchParams);
  }
}

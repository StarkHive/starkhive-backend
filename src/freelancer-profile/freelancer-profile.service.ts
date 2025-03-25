import { Injectable } from '@nestjs/common';
import { FreelancerProfileRepository } from './repositories/freelancer-profile.repository';
import { CreateFreelancerProfileDto } from './dto/create-freelancer-profile.dto';

@Injectable()
export class FreelancerProfileService {
  constructor(private readonly freelancerProfileRepository: FreelancerProfileRepository) {}

  async createProfile(payload: CreateFreelancerProfileDto) {
    return this.freelancerProfileRepository.createFreelancerProfile(payload);
  }

  async getProfileByUserId(userId: string) {
    return this.freelancerProfileRepository.findProfileByUserId(userId);
  }

  async updateSkills(id: string, skills: string[]) {
    return this.freelancerProfileRepository.updateSkills(id, skills);
  }

  async updateExperience(id: string, experience: string) {
    return this.freelancerProfileRepository.updateExperience(id, experience);
  }

  async deleteProfile(id: string) {
    return this.freelancerProfileRepository.deleteProfile(id);
  }
}

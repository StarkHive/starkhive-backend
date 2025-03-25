import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FreelancerProfile } from '../entities/freelancer-profile.entity';
import { CreateFreelancerProfileDto } from '../dto/create-freelancer-profile.dto';

@Injectable()
export class FreelancerProfileRepository {
  constructor(
    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>
  ) {}

  /**
   * Creates a new freelancer profile.
   * @param payload - Data for creating a freelancer profile.
   * @returns The newly created FreelancerProfile.
   */
  async createFreelancerProfile(payload: CreateFreelancerProfileDto): Promise<FreelancerProfile> {
    const freelancerProfile = this.freelancerProfileRepository.create(payload);
    return this.freelancerProfileRepository.save(freelancerProfile);
  }

  /**
   * Finds a freelancer profile by user ID.
   * @param userId - The ID of the user.
   * @returns The FreelancerProfile or null if not found.
   */
  async findProfileByUserId(userId: string): Promise<FreelancerProfile | null> {
    return this.freelancerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'], // Ensures user details are included
    });
  }

  /**
   * Finds a freelancer profile by ID.
   * @param id - The ID of the freelancer profile.
   * @returns The FreelancerProfile or null if not found.
   */
  async findById(id: string): Promise<FreelancerProfile | null> {
    return this.freelancerProfileRepository.findOne({
      where: { id },
      relations: ['user'], // Include user details for full profile context
    });
  }

  /**
   * Updates freelancer profile skills.
   * @param id - The ID of the freelancer profile.
   * @param skills - New skills array.
   * @returns The updated FreelancerProfile.
   * @throws NotFoundException if the profile is not found.
   */
  async updateSkills(id: string, skills: string[]): Promise<FreelancerProfile> {
    const profile = await this.findById(id);
    if (!profile) throw new NotFoundException(`Freelancer profile with ID ${id} not found`);
    
    profile.skills = skills;
    return this.freelancerProfileRepository.save(profile);
  }

  /**
   * Updates freelancer profile experience.
   * @param id - The ID of the freelancer profile.
   * @param experience - New experience text.
   * @returns The updated FreelancerProfile.
   * @throws NotFoundException if the profile is not found.
   */
  async updateExperience(id: string, experience: string): Promise<FreelancerProfile> {
    const profile = await this.findById(id);
    if (!profile) throw new NotFoundException(`Freelancer profile with ID ${id} not found`);
    
    profile.experience = experience;
    return this.freelancerProfileRepository.save(profile);
  }

  /**
   * Deletes a freelancer profile by ID.
   * @param id - The ID of the freelancer profile.
   * @throws NotFoundException if the profile does not exist.
   */
  async deleteProfile(id: string): Promise<void> {
    const profile = await this.findById(id);
    if (!profile) throw new NotFoundException(`Freelancer profile with ID ${id} not found`);
    
    await this.freelancerProfileRepository.remove(profile);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Skill, UserSkill, SkillCategory } from '../entities/skill.entity';
import { CreateSkillDto, UpdateSkillDto, AddUserSkillDto, UpdateUserSkillDto, CreateSkillCategoryDto } from '../dto/skill.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(SkillCategory)
    private categoryRepository: Repository<SkillCategory>,
  ) {}

  // Skill CRUD operations
  async createSkill(createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillRepository.create(createSkillDto);
    return await this.skillRepository.save(skill);
  }

  async findAllSkills(): Promise<Skill[]> {
    return await this.skillRepository.find();
  }

  async findSkillById(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async updateSkill(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    await this.findSkillById(id);
    await this.skillRepository.update(id, updateSkillDto);
    return await this.findSkillById(id);
  }

  // User Skills operations
  async addUserSkill(userId: string, dto: AddUserSkillDto): Promise<UserSkill> {
    const skill = await this.findSkillById(dto.skillId);
    const userSkill = this.userSkillRepository.create({
      user: { id: userId },
      skill,
      ...dto,
    });
    return await this.userSkillRepository.save(userSkill);
  }

  async updateUserSkill(userId: string, skillId: string, dto: UpdateUserSkillDto): Promise<UserSkill> {
    const userSkill = await this.userSkillRepository.findOne({
      where: { user: { id: userId }, skill: { id: skillId } },
    });
    if (!userSkill) {
      throw new NotFoundException('User skill not found');
    }
    Object.assign(userSkill, dto);
    return await this.userSkillRepository.save(userSkill);
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return await this.userSkillRepository.find({
      where: { user: { id: userId } },
      relations: ['skill'],
    });
  }

  // Skill Categories operations
  async createCategory(dto: CreateSkillCategoryDto): Promise<SkillCategory> {
    const category = this.categoryRepository.create(dto);
    return await this.categoryRepository.save(category);
  }

  async getCategories(): Promise<SkillCategory[]> {
    return await this.categoryRepository.find();
  }

  // Skill Search and Suggestions
  async searchSkills(query: string): Promise<Skill[]> {
    return await this.skillRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
    });
  }

  async getTrendingSkills(limit: number = 10): Promise<Skill[]> {
    return await this.skillRepository.find({
      order: { trendingScore: 'DESC' },
      take: limit,
    });
  }

  // Update trending score based on various factors
  async updateTrendingScore(skillId: string, score: number): Promise<void> {
    await this.skillRepository.update(skillId, { trendingScore: score });
  }

  // Skill suggestions based on user profile and trends
  async suggestSkills(userId: string): Promise<Skill[]> {
    const userSkills = await this.getUserSkills(userId);
    const userCategories = new Set(userSkills.map(us => us.skill.category));
    
    // Get skills from similar categories that the user doesn't have
    const suggestedSkills = await this.skillRepository
      .createQueryBuilder('skill')
      .where('skill.category IN (:...categories)', { categories: Array.from(userCategories) })
      .andWhere('skill.id NOT IN (:...userSkillIds)', { 
        userSkillIds: userSkills.map(us => us.skill.id) 
      })
      .orderBy('skill.trendingScore', 'DESC')
      .take(5)
      .getMany();

    return suggestedSkills;
  }
}

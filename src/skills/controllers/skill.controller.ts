import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SkillService } from '../services/skill.service';
import { CreateSkillDto, UpdateSkillDto, AddUserSkillDto, UpdateUserSkillDto, CreateSkillCategoryDto } from '../dto/skill.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  // Admin routes for managing skills
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createSkill(@Body() createSkillDto: CreateSkillDto) {
    return await this.skillService.createSkill(createSkillDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return await this.skillService.updateSkill(id, updateSkillDto);
  }

  // User skill management
  @Post('user')
  async addUserSkill(
    @CurrentUser() userId: string,
    @Body() dto: AddUserSkillDto,
  ) {
    return await this.skillService.addUserSkill(userId, dto);
  }

  @Put('user/:skillId')
  async updateUserSkill(
    @CurrentUser() userId: string,
    @Param('skillId') skillId: string,
    @Body() dto: UpdateUserSkillDto,
  ) {
    return await this.skillService.updateUserSkill(userId, skillId, dto);
  }

  @Get('user')
  async getUserSkills(@CurrentUser() userId: string) {
    return await this.skillService.getUserSkills(userId);
  }

  // Skill categories
  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createCategory(@Body() dto: CreateSkillCategoryDto) {
    return await this.skillService.createCategory(dto);
  }

  @Get('categories')
  async getCategories() {
    return await this.skillService.getCategories();
  }

  // Search and suggestions
  @Get('search')
  async searchSkills(@Query('q') query: string) {
    return await this.skillService.searchSkills(query);
  }

  @Get('trending')
  async getTrendingSkills(@Query('limit') limit: number) {
    return await this.skillService.getTrendingSkills(limit);
  }

  @Get('suggestions')
  async getSkillSuggestions(@CurrentUser() userId: string) {
    return await this.skillService.suggestSkills(userId);
  }

  @Get()
  async getAllSkills() {
    return await this.skillService.findAllSkills();
  }

  @Get(':id')
  async getSkillById(@Param('id') id: string) {
    return await this.skillService.findSkillById(id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill, UserSkill, SkillCategory } from './entities/skill.entity';
import { SkillService } from './services/skill.service';
import { SkillController } from './controllers/skill.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, UserSkill, SkillCategory]),
  ],
  providers: [SkillService],
  controllers: [SkillController],
  exports: [SkillService],
})
export class SkillsModule {}

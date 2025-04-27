import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobTagsController } from './job-tags.controller';
import { JobTagsService } from './job-tags.service';
import { JobTag } from './entities/job-tag.entity';
import { TagVote } from './entities/tag-vote.entity';
import { Job } from './entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobTag, TagVote, Job])],
  controllers: [JobTagsController],
  providers: [JobTagsService],
  exports: [JobTagsService],
})
export class JobTagsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingsService } from './job-postings.service';
import { JobPostingsController } from './job-postings.controller';
import { JobPosting } from './entities/job-posting.entity';
import { NotificationsModule } from '@src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule, TypeOrmModule.forFeature([JobPosting])],
  controllers: [JobPostingsController],
  providers: [JobPostingsService],

  exports: [JobPostingsService],
})
export class JobPostingsModule {}

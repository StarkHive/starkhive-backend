import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ReminderService } from './reminder.service';
import { Project } from './entities/project.entity';
import { Milestone } from './entities/milestone.entity';
import { Deliverable } from './entities/deliverable.entity';
import { Task } from './entities/task.entity';
import { FileAttachment } from './entities/file-attachment.entity';
import { TimeLog } from './entities/time-log.entity';
import { User } from 'src/user/entities/user.entity';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Milestone,
      Deliverable,
      Task,
      FileAttachment,
      TimeLog,
      User,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = uuid();
          const extension = extname(file.originalname);
          callback(null, `${uniqueName}${extension}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ReminderService],
  exports: [ProjectService, ReminderService],
})
export class ProjectModule {} 
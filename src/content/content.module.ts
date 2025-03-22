import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { Content } from './entities/content.entity';
import { AuditModule } from '../audit/audit.module';
import { User } from '@src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content,User]),
    AuditModule,
  ],
  providers: [ContentService],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}

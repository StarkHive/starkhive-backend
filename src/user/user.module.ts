import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuditModule } from '../audit/audit.module';
import { Report } from '../reporting/entities/report.entity';
import { AuditLog } from '../audit/entitites/audit-log.entity';
import { Content } from '../content/entities/content.entity';

import { UserRepository } from './repositories/user.repositories';
import { UserImportService } from './providers/user-import.service';
import { MailModule } from '@src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Content, Report, AuditLog]),
    AuditModule, forwardRef(() => MailModule)
  ], // Ensure User is included here
  controllers: [UserController],
  providers: [UserService, UserRepository, UserImportService],
  exports: [UserService, TypeOrmModule, UserRepository],
})
export class UserModule {}

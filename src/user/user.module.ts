import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuditModule } from '@src/audit/audit.module';
import { Report } from '@src/reporting/entities/report.entity';
import { AuditLog } from '@src/audit/entitites/audit-log.entity';
import { Content } from '@src/content/entities/content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Content,Report,AuditLog]),AuditModule], // Ensure User is included here
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

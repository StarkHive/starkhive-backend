import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyPostingsService } from './company-postings.service';
import { CompanyPostingsController } from './company-postings.controller';
import { CompanyPosting } from './entities/company-posting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyPosting])],
  controllers: [CompanyPostingsController],
  providers: [CompanyPostingsService],
  exports: [CompanyPostingsService],
})
export class CompanyPostingsModule {}

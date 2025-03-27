import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';
import { UserProfile } from './entities/user-profile.entity';
import { UserProfileRepository } from './repository/user-profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  controllers: [UserProfileController],
  providers: [UserProfileService, UserProfileRepository],
  exports: [UserProfileService, UserProfileRepository],
})
export class UserProfileModule {}

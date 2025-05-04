import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReferralProgramController } from "./referral-program.controller"
import { ReferralProgramService } from "./referral-program.service"
import { Referral } from "./entities/referral.entity"
import { ReferralReward } from "./entities/referral-reward.entity"
import { UserModule } from "@src/user/user.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Referral, ReferralReward]),  
    forwardRef(() => UserModule),
  ],
  controllers: [ReferralProgramController],
  providers: [ReferralProgramService],
  exports: [ReferralProgramService],
})
export class ReferralProgramModule {}

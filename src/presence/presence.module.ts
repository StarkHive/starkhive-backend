import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
// import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@src/user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PresenceGateway } from './presence/presence.gateway';

@Module({
  imports: [
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: '1h' },
    // }),
    ScheduleModule.forRoot(),
    UserModule,
  ],
  providers: [PresenceService, PresenceGateway],
  exports: [PresenceService],
})
export class PresenceModule {}

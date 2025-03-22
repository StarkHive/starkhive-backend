import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './entities/connection.entity';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { UserModule } from '../user/user.module';
import { ConnectionNotification } from '../notifications/entities/connection-notification.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Connection, ConnectionNotification]), UserModule],
  controllers: [ConnectionController],
  providers: [ConnectionService, JwtService],
  exports: [ConnectionService],
})
export class ConnectionModule {}

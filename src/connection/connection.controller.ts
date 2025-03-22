import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { Connection } from './entities/connection.entity';
import { User } from '@src/user/entities/user.entity';

@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('request')
  async sendConnectionRequest(
    @Body() body: { requesterId: string; recipientId: string },
  ): Promise<Connection> {
    return this.connectionService.sendConnectionRequest(
      body.requesterId,
      body.recipientId,
    );
  }

  @Get('accept/connection/:connectionId')
  async acceptConnectionRequest(
    @Param('connectionId') connectionId: string,
  ): Promise<Connection> {
    return this.connectionService.acceptConnectionRequest(connectionId);
  }

  @Delete('decline/:connectionId')
  async declineConnectionRequest(
    @Param('connectionId') connectionId: string,
  ): Promise<void> {
    return this.connectionService.declineConnectionRequest(connectionId);
  }

  @Get('recommendations/:userId')
  async recommendConnections(@Param('userId') userId: string): Promise<User[]> {
    return this.connectionService.recommendConnections(userId);
  }

  @Get('degree/:userId/:targetUserId')
  async findConnectionDegree(
    @Param('userId') userId: string,
    @Param('targetUserId') targetUserId: string,
  ): Promise<number> {
    return this.connectionService.findConnectionDegree(userId, targetUserId);
  }

  @Get('user/:userId')
  async getUserConnections(@Param('userId') userId: string) {
    return this.connectionService.getUserConnections(userId);
  }

  @Patch('privacy/:userId')
  async updatePrivacySettings(
    @Param('userId') userId: string,
    @Query() status: string,
  ): Promise<User> {
    return this.connectionService.updatePrivacySettings(userId, status);
  }

  @Get(':connectionId')
  async getConnectionById(
    @Param('connectionId') connectionId: string,
  ): Promise<Connection> {
    return this.connectionService.getConnectionById(connectionId);
  }
}

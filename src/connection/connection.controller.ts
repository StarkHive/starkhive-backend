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
import { User } from '../user/entities/user.entity';

import { CacheService } from "@src/cache/cache.service";

@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService, private cacheManager: CacheService) {}

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
    const cachedAcceptedConnectionRequest = await this.cacheManager.get(`connections:${connectionId}`, 'ConnectionService');
    if (cachedAcceptedConnectionRequest) {
      return cachedAcceptedConnectionRequest;
    }
    const acceptedConnectionRequest = await this.connectionService.acceptConnectionRequest(connectionId);
    await this.cacheManager.set(`connections:${connectionId}`, acceptedConnectionRequest);
    return acceptedConnectionRequest;
  }

  @Delete('decline/:connectionId')
  async declineConnectionRequest(
    @Param('connectionId') connectionId: string,
  ): Promise<void> {
    await this.cacheManager.del(`connections:${connectionId}`);
    return this.connectionService.declineConnectionRequest(connectionId);
  }

  @Get('recommendations/:userId')
  async recommendConnections(@Param('userId') userId: string): Promise<User[]> {
    const cachedRecommendConnections = await this.cacheManager.get(`connections:recommendations:${userId}`, 'ConnectionService');
    if (cachedRecommendConnections) {
      return cachedRecommendConnections;
    }
    const recommendConnections = await this.connectionService.recommendConnections(userId);
    await this.cacheManager.set(`connections:recommendations:${userId}`, recommendConnections);
    return recommendConnections;
  }

  @Get('degree/:userId/:targetUserId')
  async findConnectionDegree(
    @Param('userId') userId: string,
    @Param('targetUserId') targetUserId: string,
  ): Promise<number> {
    const cachedConnectionDegree = await this.cacheManager.get(`connections:degree:${userId}:${targetUserId}`, 'ConnectionService');
    if (cachedConnectionDegree) {
      return cachedConnectionDegree;
    }
    const connectionDegree = await this.connectionService.findConnectionDegree(userId, targetUserId);
    await this.cacheManager.set(`connections:degree:${userId}:${targetUserId}`, connectionDegree);
    return connectionDegree;
  }

  @Get('user/:userId')
  async getUserConnections(@Param('userId') userId: string) {
    const cachedUserConnections = await this.cacheManager.get(`connections:user:${userId}`, 'ConnectionService');
    if (cachedUserConnections) {
      return cachedUserConnections;
    }
    const userConnections = await this.connectionService.getUserConnections(userId);
    await this.cacheManager.set(`connections:user:${userId}`, userConnections);
    return userConnections;
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
    const cachedConnection = await this.cacheManager.get(`connections:${connectionId}`, 'ConnectionService');
    if (cachedConnection) {
      return cachedConnection;
    }
    const connection = await this.connectionService.getConnectionById(connectionId);
    await this.cacheManager.set(`connections:${connectionId}`, connection);
    return connection;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Connection, ConnectionStatus } from './entities/connection.entity';
import { User } from '@src/user/entities/user.entity';
import { ConnectionNotification } from '../notifications/entities/connection-notification.entity';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionRepository: Repository<Connection>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ConnectionNotification)
    private readonly notificationRepository: Repository<ConnectionNotification>,
  ) {}

  async sendConnectionRequest(
    requesterId: string,
    recipientId: string,
  ): Promise<Connection> {
    if (requesterId === recipientId) {
      throw new BadRequestException('You cannot connect with yourself.');
    }

    const existingConnection = await this.connectionRepository.findOne({
      where: [
        { requester: { id: requesterId }, recipient: { id: recipientId } },
        { requester: { id: recipientId }, recipient: { id: requesterId } },
      ],
    });

    if (existingConnection) {
      throw new BadRequestException('Connection request already exists.');
    }

    const requester = await this.userRepository.findOne({
      where: { id: requesterId },
    });
    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    if (!requester || !recipient) {
      throw new NotFoundException('User not found.');
    }

    const connection = this.connectionRepository.create({
      requester,
      recipient,
      status: ConnectionStatus.PENDING,
    });

    await this.sendConnectionNotification(
      recipientId,
      `${requester.username} sent you a connection request.`,
    );
    return this.connectionRepository.save(connection);
  }

  async acceptConnectionRequest(connectionId: string): Promise<Connection> {
    console.log('Received connectionId:', connectionId);

    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });
    if (!connection) {
      throw new NotFoundException('Connection request not found.');
    }
    console.log(connection);
    connection.status = ConnectionStatus.CONNECTED;
    connection.connectedAt = new Date();

    await this.sendConnectionNotification(
      connection.requester?.username ??
        connection.requester?.email.split('@')[0],
      `Your connection request to ${connection.recipient?.username} was accepted.`,
    );
    return this.connectionRepository.save(connection);
  }

  async declineConnectionRequest(connectionId: string): Promise<void> {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });
    if (!connection) {
      throw new NotFoundException('Connection request not found.');
    }
    await this.connectionRepository.remove(connection);
  }

  async recommendConnections(userId: string): Promise<User[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const connectedUserIds = await this.getUserConnectedIds(userId);
    return this.userRepository.find({
      where: {
        id: Not(In([...connectedUserIds, userId])),
      },
      take: 5,
    });
  }

  async findConnectionDegree(
    userId: string,
    targetUserId: string,
  ): Promise<any> {
    const firstDegree = await this.connectionRepository.findOne({
      where: [
        {
          requester: { id: userId },
          recipient: { id: targetUserId },
          status: ConnectionStatus.CONNECTED,
        },
        {
          requester: { id: targetUserId },
          recipient: { id: userId },
          status: ConnectionStatus.CONNECTED,
        },
      ],
    });
    if (firstDegree) return { degree: 1};

    const secondDegree = await this.connectionRepository.findOne({
      where: [
        { requester: { id: userId }, status: ConnectionStatus.CONNECTED },
        { recipient: { id: targetUserId }, status: ConnectionStatus.CONNECTED },
      ],
    });
    if (secondDegree) return {degree: 2};

    return {degree: 3};
  }

  async sendConnectionNotification(recipientId: string, message: string) {
    const user = await this.userRepository.findOne({
      where: { id: recipientId },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const notification = this.notificationRepository.create({
      user,
      message,
      isRead: false,
    });
    await this.notificationRepository.save(notification);
  }

  async getUserConnections(userId: string) {
    const connections = await this.connectionRepository.find({
      where: [
        { requester: { id: userId }, status: ConnectionStatus.CONNECTED },
        { recipient: { id: userId }, status: ConnectionStatus.CONNECTED },
      ],
      relations: ['requester', 'recipient'],
    });

    return {totalcount: connections.length, connections}
  }

  async getUserConnectedIds(userId: string): Promise<string[]> {
    const connections = await this.connectionRepository.find({
      where: [
        { requester: { id: userId }, status: ConnectionStatus.CONNECTED },
        { recipient: { id: userId }, status: ConnectionStatus.CONNECTED },
      ],
    });
    return connections.map((conn) =>
      conn.requester?.id === userId ? conn.recipient?.id ?? '' : conn.requester?.id ?? '',
    ).filter(id => id); 
  }

  async updatePrivacySettings(userId: string, status: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    user.connectionPrivacy = status;
    return this.userRepository.save(user);
  }

  async getConnectionById(connectionId: string): Promise<Connection> {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
      relations: ['requester', 'recipient'],
    });
  
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
  
    return connection;
  }
  
}

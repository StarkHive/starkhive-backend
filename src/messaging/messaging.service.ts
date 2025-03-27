import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { SearchMessagesDto } from './dto/search-messages.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const recipient = await this.userRepository.findOne({ where: { id: createMessageDto.recipientId } });

    if (!sender || !recipient) {
      throw new NotFoundException('User not found');
    }

    const message = this.messageRepository.create({
      content: createMessageDto.content,
      sender,
      recipient,
      metadata: {
        clientTimestamp: new Date().toISOString(),
      }
    });

    // Create search vector for full-text search
    await this.messageRepository.query(`
      UPDATE messages 
      SET search_vector = to_tsvector('english', $1) 
      WHERE id = $2
    `, [createMessageDto.content, message.id]);

    return this.messageRepository.save(message);
  }

  async searchMessages(userId: string, searchDto: SearchMessagesDto) {
    const queryBuilder = this.messageRepository.createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .where('(message.sender = :userId OR message.recipient = :userId)', { userId })
      .andWhere('message.isDeleted = false');

    if (searchDto.query) {
      queryBuilder.andWhere('message.searchVector @@ plainto_tsquery(:query)', { 
        query: searchDto.query 
      });
    }

    if (searchDto.partnerId) {
      queryBuilder.andWhere(
        '(message.sender = :partnerId OR message.recipient = :partnerId)',
        { partnerId: searchDto.partnerId }
      );
    }

    if (searchDto.startDate) {
      queryBuilder.andWhere('message.createdAt >= :startDate', {
        startDate: searchDto.startDate,
      });
    }

    if (searchDto.endDate) {
      queryBuilder.andWhere('message.createdAt <= :endDate', {
        endDate: searchDto.endDate,
      });
    }

    queryBuilder.orderBy('message.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async archiveMessage(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'recipient'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.id !== userId && message.recipient.id !== userId) {
      throw new NotFoundException('Message not found');
    }

    message.isArchived = true;
    return this.messageRepository.save(message);
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'recipient'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.id !== userId) {
      throw new NotFoundException('Message not found');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await this.messageRepository.save(message);
  }
}

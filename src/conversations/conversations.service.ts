import { Injectable } from '@nestjs/common';
import { Conversation } from './conversation.entity';
import { ConversationRepository } from './conversation.repository';

@Injectable()
export class ConversationsService {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async createConversation(participants: string[]): Promise<Conversation> {
    const conversation = new Conversation();
    conversation.participants = participants;
    return this.conversationRepository.save(conversation);
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.findByUserId(userId);
  }

  async getConversationById(conversationId: string): Promise<Conversation> {
    return this.conversationRepository.findOne(conversationId);
  }

  async addMessageToConversation(conversationId: string, messageId: string): Promise<Conversation> {
    const conversation = await this.getConversationById(conversationId);
    conversation.messageHistory.push(messageId);
    return this.conversationRepository.save(conversation);
  }
}
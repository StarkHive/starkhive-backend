import { Injectable } from '@nestjs/common';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  private messages: Message[] = [];

  create(createMessageDto: CreateMessageDto): Message {
    const newMessage: Message = {
      id: (this.messages.length + 1).toString(),
      ...createMessageDto,
      receiverId: createMessageDto.receiverId, // Ensure receiverId is included
      status: 'sent', // Default status
      timestamp: new Date(), // Add timestamp
      createdAt: new Date(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  findOne(id: string): Message | undefined {
    return this.messages.find((message) => message.id === id);
  }

  findAll(): Message[] {
    return this.messages;
  }

  // Mock implementation for repository methods
  save(message: Message): Message {
    this.messages.push(message);
    return message;
  }

  findByConversationId(conversationId: string): Message[] {
    return this.messages.filter((message) => message.roomId === conversationId);
  }

  search(query: string): Message[] {
    return this.messages.filter((message) =>
      message.content.toLowerCase().includes(query.toLowerCase()),
    );
  }
}
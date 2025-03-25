import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messagesService.create(createMessageDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Message> {
    return this.messagesService.findOne(id);
  }

  @Get()
  async findAll(): Promise<Message[]> {
    return this.messagesService.findAll();
  }
}
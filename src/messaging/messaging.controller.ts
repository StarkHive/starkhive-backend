import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { SearchMessagesDto } from './dto/search-messages.dto';
import { Message } from './entities/message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('messaging')
@Controller('messaging')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'Message created successfully', type: Message })
  async createMessage(
    @CurrentUser() userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    return this.messagingService.createMessage(userId, createMessageDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully', type: [Message] })
  async searchMessages(
    @CurrentUser() userId: string,
    @Query() searchDto: SearchMessagesDto,
  ): Promise<Message[]> {
    return this.messagingService.searchMessages(userId, searchDto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a message' })
  @ApiResponse({ status: 200, description: 'Message archived successfully', type: Message })
  async archiveMessage(
    @CurrentUser() userId: string,
    @Param('id') messageId: string,
  ): Promise<Message> {
    return this.messagingService.archiveMessage(messageId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  async deleteMessage(
    @CurrentUser() userId: string,
    @Param('id') messageId: string,
  ): Promise<void> {
    return this.messagingService.deleteMessage(messageId, userId);
  }
}

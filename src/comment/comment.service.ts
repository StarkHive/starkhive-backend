import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createComment(createDto: CreateCommentDto, authorId: string): Promise<Comment> {
    const { parentId, entityId, entityType, content, mentions } = createDto;

    const comment = this.commentRepository.create({
      content,
      authorId,
      entityId,
      entityType,
      mentions,
    });

    if (parentId) {
      const parentComment = await this.commentRepository.findOne({ where: { id: parentId } });
      if (!parentComment) {
        throw new NotFoundException(`Parent comment not found`);
      }
      comment.parent = parentComment;
    }

    const savedComment = await this.commentRepository.save(comment);

    // Create mention notifications if applicable
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        await this.notificationsService.createMentionNotification(mentionedUserId, savedComment.id);
      }
    }

    return savedComment;
  }

  async getCommentsByEntity(entityType: string, entityId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { entityType, entityId, parent: null },
      relations: ['replies', 'replies.replies'],
    });
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['parent', 'replies'] });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return comment;
  }

  async updateComment(id: string, updateDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.getCommentById(id);
    Object.assign(comment, updateDto);
    return this.commentRepository.save(comment);
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.getCommentById(id);
    await this.commentRepository.remove(comment);
  }

  async moderateComment(id: string, status: 'flagged' | 'removed') {
    const comment = await this.getCommentById(id);
    comment.status = status;
    return this.commentRepository.save(comment);
  }
}

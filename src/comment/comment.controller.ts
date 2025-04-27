import { Controller, Post, Get, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CacheService } from "@src/cache/cache.service";

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService, private cacheManager: CacheService) {}

  @Post()
  async createComment(@Body() dto: CreateCommentDto, @Req() req: any) {
    // Assume req.user holds the authenticated user's data
    const authorId = req.user?.id;
    return this.commentService.createComment(dto, authorId);
  }

  @Get(':entityType/:entityId')
  async getComments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const cachedComments = await this.cacheManager.get(`comments:${entityType}:${entityId}`, 'CommentService');
    if (cachedComments) {
      return cachedComments;
    }
    const comments = this.commentService.getCommentsByEntity(entityType, entityId);
    await this.cacheManager.set(`comments:${entityType}:${entityId}`, comments);
    return comments;
  }

  @Patch(':id')
  async updateComment(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    await this.cacheManager.del(`comments:${id}`);
    return this.commentService.updateComment(id, dto);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    await this.cacheManager.del(`comments:${id}`);
    return this.commentService.deleteComment(id);
  }
}

import { Controller, Post, Get, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

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
    return this.commentService.getCommentsByEntity(entityType, entityId);
  }

  @Patch(':id')
  async updateComment(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentService.updateComment(id, dto);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}

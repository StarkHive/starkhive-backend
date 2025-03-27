import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(req.user.id, createPostDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(req.user.id, id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.postService.deletePost(req.user.id, id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Req() req: any, @Param('id') id: string) {
    return this.postService.getPost(req.user.id, id);
  }

  @Get('activity-feed')
  @UseGuards(JwtAuthGuard)
  async getActivityFeed(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.postService.getActivityFeed(req.user.id, page, limit);
  }

  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard)
  async react(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() reactionDto: CreateReactionDto,
  ) {
    return this.postService.reactToPost(req.user.id, postId, reactionDto);
  }
}

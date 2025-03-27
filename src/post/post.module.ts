import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { PostReaction } from './entities/post-reaction.entity';
import { PostRepository } from './repositories/post.repository';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { UserModule } from 'src/user/user.module';
import { PostReactionRepository } from './repositories/post-reaction.repository';
import { Hashtag } from './entities/hashtag.entity';
import { PostImageRepository } from './repositories/post-image.repository';
import { HashtagRepository } from './repositories/hashtag.repository'; // Ensure this exists

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage, PostReaction, Hashtag]),
    UserModule,
  ],
  providers: [
    PostService,
    PostRepository,
    PostImageRepository,
    PostReactionRepository,
    HashtagRepository,
    Function,
  ],
  controllers: [PostController],
  exports: [
    PostService,
    PostRepository,
    PostImageRepository,
    PostReactionRepository,
    HashtagRepository,
    Function,
  ],
})
export class PostModule {}

import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Post } from "./entities/post.entity"
import { PostImage } from "./entities/post-image.entity"
import { PostReaction } from "./entities/post-reaction.entity"
import { Hashtag } from "./entities/hashtag.entity"
import { PostRepository } from "./repositories/post.repository"
import { HashtagRepository } from "./repositories/hashtag.repository"
import { PostController } from "./post.controller"
import { PostService } from "./post.service"
import { UserModule } from "src/user/user.module"


@Module({
  imports: [TypeOrmModule.forFeature([Post, PostImage, PostReaction, Hashtag]), UserModule],
  providers: [PostRepository, HashtagRepository, PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}


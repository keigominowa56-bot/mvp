import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { Region } from '../../entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Region])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
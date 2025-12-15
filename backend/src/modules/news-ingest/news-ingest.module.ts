import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsIngestService } from './news-ingest.service';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User])],
  providers: [NewsIngestService],
  exports: [NewsIngestService],
})
export class NewsIngestModule {}
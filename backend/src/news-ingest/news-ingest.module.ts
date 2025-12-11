import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsIngestService } from './news-ingest.service';
import { NewsIngestController } from './news-ingest.controller';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User])],
  controllers: [NewsIngestController],
  providers: [NewsIngestService],
  exports: [NewsIngestService],
})
export class NewsIngestModule {}
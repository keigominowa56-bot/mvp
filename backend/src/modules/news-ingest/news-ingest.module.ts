import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsIngestService } from './news-ingest.service';
import { NewsIngestController } from './news-ingest.controller';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User])],
  controllers: [NewsIngestController],
  providers: [NewsIngestService],
  exports: [NewsIngestService],
})
export class NewsIngestModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PoliticianProfile } from '../../entities/politician-profile.entity';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { Party } from '../../entities/party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PoliticianProfile, Post, User, Party])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
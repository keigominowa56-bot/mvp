import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NgWord } from '../../entities/ng-word.entity';
import { NgWordsService } from './ng-words.service';
import { NgWordsController } from './ng-words.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NgWord])],
  providers: [NgWordsService],
  controllers: [NgWordsController],
  exports: [NgWordsService],
})
export class ModerationModule {}
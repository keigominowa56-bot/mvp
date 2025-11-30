import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsController } from './recommendations.controller';
import { User } from '../../entities/user.entity';
import { Follow } from '../follows/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow])],
  controllers: [RecommendationsController],
})
export class RecommendationsModule {}
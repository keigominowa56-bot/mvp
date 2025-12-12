import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { User } from './entities/user.entity';
import { Region } from './entities/region.entity';
import { Party } from './entities/party.entity';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Vote } from './entities/vote.entity';
import { Follow } from './entities/follow.entity';
import { PoliticianProfile, FundingSpendingItem } from './entities/politician-profile.entity';
import { Media } from './entities/media.entity';
import { Survey } from './entities/survey.entity';
import { SurveyResponse } from './entities/survey-response.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Notification } from './entities/notification.entity';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PoliticiansModule } from './modules/politicians/politicians.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { VotesModule } from './modules/votes/votes.module';
import { FollowsModule } from './modules/follows/follows.module';
import { SearchModule } from './modules/search/search.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NewsIngestModule } from './modules/news-ingest/news-ingest.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 30,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST'),
        port: parseInt(cfg.get<string>('DB_PORT') || '3306', 10),
        username: cfg.get<string>('DB_USER'),
        password: cfg.get<string>('DB_PASS'),
        database: cfg.get<string>('DB_NAME'),
        entities: [
          User, Region, Party, Post, Comment, Vote, Follow,
          PoliticianProfile, FundingSpendingItem,
          Media,
          Survey, SurveyResponse,
          WalletTransaction,
          Notification,
        ],
        synchronize: true,
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    PoliticiansModule,
    PostsModule,
    CommentsModule,
    VotesModule,
    FollowsModule,
    SearchModule,
    SurveysModule,
    WalletModule,
    NotificationsModule,
    AnalyticsModule,
    NewsIngestModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
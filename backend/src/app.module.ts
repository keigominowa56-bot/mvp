import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers/Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities (absolute imports resolve via tsconfig paths)
import { User } from 'src/entities/user.entity';
import { Region } from 'src/entities/region.entity';
import { Party } from 'src/entities/party.entity';
import { Post } from 'src/entities/post.entity';
import { Comment } from 'src/entities/comment.entity';
import { CommentReaction } from 'src/entities/comment-reaction.entity';
import { Vote } from 'src/entities/vote.entity';
import { Follow } from 'src/entities/follow.entity';
import { PoliticianProfile, FundingSpendingItem } from 'src/entities/politician-profile.entity';
import { Media } from 'src/entities/media.entity';
import { Survey } from 'src/entities/survey.entity';
import { SurveyResponse } from 'src/entities/survey-response.entity';
import { WalletTransaction } from 'src/entities/wallet-transaction.entity';
import { Notification } from 'src/entities/notification.entity';

// Feature modules
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { CommentsModule } from 'src/modules/comments/comments.module';
import { VotesModule } from 'src/modules/votes/votes.module';
import { FollowsModule } from 'src/modules/follows/follows.module';
import { PoliticiansModule } from 'src/modules/politicians/politicians.module';
import { SurveysModule } from 'src/modules/surveys/surveys.module';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { AnalyticsModule } from 'src/modules/analytics/analytics.module';
import { NewsIngestModule } from 'src/modules/news-ingest/news-ingest.module';
import { MediaModule } from 'src/modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Use Throttler v5-compatible option format (array of throttlers)
    ThrottlerModule.forRoot([{ ttl: 60, limit: 30 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST') || 'localhost',
        port: parseInt(cfg.get<string>('DB_PORT') || '5432', 10),
        username: cfg.get<string>('DB_USER') || 'postgres',
        password: cfg.get<string>('DB_PASS') || '',
        database: cfg.get<string>('DB_NAME') || 'app',
        entities: [
          User, Region, Party, Post, Comment, CommentReaction, Vote, Follow,
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
    PostsModule,
    CommentsModule,
    VotesModule,
    FollowsModule,
    PoliticiansModule,
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
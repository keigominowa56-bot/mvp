import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ConfigModule } from '@nestjs/config';

import { DevModule } from './auth/dev.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PoliticiansModule } from './modules/politicians/politicians.module';
import { FollowsModule } from './modules/follows/follows.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { HealthModule } from './health/health.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_FILE || 'dev.sqlite',
      synchronize: true,
      entities: [join(__dirname, '/**/*.entity.{ts,js}')],
    }),
    ...(isProd ? [] : [DevModule]),
    AuthModule,
    PostsModule,
    RecommendationsModule,
    NotificationsModule,
    UsersModule,
    AnalyticsModule,
    PoliticiansModule,
    FollowsModule,
    ActivityLogsModule,
    ModerationModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
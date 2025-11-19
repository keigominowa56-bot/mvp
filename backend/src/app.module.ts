import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { MembersModule } from './modules/members/members.module';
import { PledgesModule } from './modules/pledges/pledges.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { ActivityFundsModule } from './modules/activity-funds/activity-funds.module';
import { UsersModule } from './modules/users/users.module';
import { VotesModule } from './modules/votes/votes.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { ExternalFeedsModule } from './modules/external-feeds/external-feeds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    MembersModule,
    PledgesModule,
    ActivityLogsModule,
    ActivityFundsModule,
    UsersModule,
    VotesModule,
    AuthModule,
    AdminModule,
    ExternalFeedsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

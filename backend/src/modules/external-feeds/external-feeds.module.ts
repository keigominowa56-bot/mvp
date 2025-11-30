import { Module } from '@nestjs/common';
import { ExternalFeedsService } from './external-feeds.service';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ExternalFeedsController } from './external-feeds.controller';

@Module({
  imports: [ActivityLogsModule],
  providers: [ExternalFeedsService],
  controllers: [ExternalFeedsController],
  exports: [ExternalFeedsService],
})
export class ExternalFeedsModule {}
import { Controller, Post, Body } from '@nestjs/common';
import { ExternalFeedsService, ExternalTweet } from './external-feeds.service';

@Controller('external-feeds')
export class ExternalFeedsController {
  constructor(private readonly feeds: ExternalFeedsService) {}

  @Post('import/tweets')
  importTweets(
    @Body() body: { memberId: string; tweets: ExternalTweet[] },
  ) {
    return this.feeds.importTweets(body.memberId, body.tweets || []);
  }
}
// Ensure correct import path to FollowsService
import { Controller, Get, Param } from '@nestjs/common';
import { FollowsService } from '../follows/follows.service';

@Controller('search/follows')
export class SearchFollowsController {
  constructor(private readonly follows: FollowsService) {}

  @Get(':userId/list')
  async list(@Param('userId') userId: string) {
    return this.follows.listFollowedIds(userId);
  }
}
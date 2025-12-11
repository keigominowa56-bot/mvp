import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { PostType } from '../../enums/post-type.enum';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get('politicians')
  async searchPoliticians(
    @Query('region') region?: string,
    @Query('party') party?: string,
    @Query('q') q?: string,
  ) {
    return this.search.searchPoliticians({ region, party, q });
  }

  @Get('posts')
  async searchPosts(@Query('q') q?: string, @Query('type') type?: PostType) {
    return this.search.searchPosts({ q, type });
  }
}
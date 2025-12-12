import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../guards/roles.decorator';
import type { UserRole } from '../../enums/user-role.enum';

@Controller('moderation/ng-words')
export class NgWordsController {
  @Roles('admin' as UserRole)
  @Get()
  list() {
    return { words: ['badword1', 'badword2'] };
  }
}
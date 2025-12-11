import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Region } from '../../entities/region.entity';
import { Party } from '../../entities/party.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Region, Party])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
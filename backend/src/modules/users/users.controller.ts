import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list() {
    return this.users.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() dto: {
    name?: string;
    username?: string;
    profileImageUrl?: string;
    supportedPartyId?: string;
  }) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.users.updateProfile(userId, dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Post()
  async createUser(@Body() dto: RegisterUserDto) {
    return this.users.createUser(dto);
  }
}
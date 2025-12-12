import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list() {
    return this.users.findAll();
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
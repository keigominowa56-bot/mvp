import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@Controller('admin')
export class AdminController {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  @Get('users')
  async listUsers() {
    return this.users.find();
  }

  @Patch('users/:id/role')
  async setRole(@Param('id') id: string, @Body() body: { role: UserRoleEnum }) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) return { ok: false };
    user.role = body.role;
    await this.users.save(user);
    return { ok: true };
  }

  @Patch('users/:id/age-group')
  async setAgeGroup(@Param('id') id: string, @Body() body: { ageGroup: string }) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) return { ok: false };
    user.ageGroup = body.ageGroup;
    await this.users.save(user);
    return { ok: true };
  }
}
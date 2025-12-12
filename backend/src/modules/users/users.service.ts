import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Region } from '../../entities/region.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Region) private readonly regions: Repository<Region>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.users.find({ relations: ['region', 'supportedParty'] });
  }

  async findOne(id: string): Promise<User> {
    const u = await this.users.findOne({ where: { id }, relations: ['region', 'supportedParty'] });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async findByEmailOrPhone(id: string) {
    return this.users.findOne({ where: [{ email: id }, { phone: id }], relations: ['region', 'supportedParty'] });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.users.findOne({ where: [{ email: dto.email }, { phone: dto.phone }, { nickname: dto.nickname }] });
    if (exists) throw new Error('User already exists');
    const region = dto.regionId ? await this.regions.findOne({ where: { id: dto.regionId } }) : null;
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const u = this.users.create({ ...dto, passwordHash, region });
    return this.users.save(u);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const u = await this.findOne(id);
    Object.assign(u, dto);
    return this.users.save(u);
  }

  async remove(id: string): Promise<void> {
    await this.users.delete({ id });
  }
}
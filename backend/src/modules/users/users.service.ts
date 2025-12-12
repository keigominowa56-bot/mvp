import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { RegisterUserDto } from '../../auth/dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<User> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmailOrPhone(id: string): Promise<User | null> {
    return this.repo.findOne({ where: [{ email: id }, { phone: id }] });
  }

  async create(dto: Partial<User>): Promise<User> {
    const u = this.repo.create(dto);
    return this.repo.save(u);
  }

  async update(id: string, partial: Partial<User>): Promise<User> {
    const u = await this.findOne(id);
    Object.assign(u, partial);
    return this.repo.save(u);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async createUser(dto: RegisterUserDto): Promise<User> {
    const dup = await this.repo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }, { nickname: dto.nickname }],
    });
    if (dup) throw new Error('User already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      name: dto.name,
      nickname: dto.nickname,
      ageGroup: String(dto.ageGroup),
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: 'user',
      kycStatus: 'pending',
      regionId: dto.regionId || null,
    });
    return this.repo.save(user);
  }
}
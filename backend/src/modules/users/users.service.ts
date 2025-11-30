import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

type CreateUserDto = {
  email: string;
  password: string;
  name?: string;
  age?: number;
  addressPref?: string;
  addressCity?: string;
  phoneNumber?: string; // 旧 phone
  governmentIdUrl?: string;
  role?: 'user' | 'politician' | 'admin';
};

type UpdateUserDto = {
  name?: string;
  age?: number;
  addressPref?: string;
  addressCity?: string;
  phoneNumber?: string;
  governmentIdUrl?: string;
  role?: 'user' | 'politician' | 'admin';
  status?: 'active' | 'banned';
};

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async create(dto: CreateUserDto) {
    if (!dto.email || !dto.password) throw new BadRequestException('email & password required');
    const exist = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exist) throw new BadRequestException('email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const entity = this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      age: dto.age,
      addressPref: dto.addressPref,
      addressCity: dto.addressCity,
      phoneNumber: dto.phoneNumber,
      governmentIdUrl: dto.governmentIdUrl,
      role: dto.role || 'user',
      status: 'active',
      kycStatus: 'verified',
      planTier: 'free',
    });

    return this.userRepository.save(entity);
  }

  async update(id: string, dto: UpdateUserDto) {
    const u = await this.userRepository.findOne({ where: { id } });
    if (!u) throw new BadRequestException('user not found');

    if (dto.name !== undefined) u.name = dto.name || undefined;
    if (dto.age !== undefined) u.age = dto.age!;
    if (dto.addressPref !== undefined) u.addressPref = dto.addressPref || undefined;
    if (dto.addressCity !== undefined) u.addressCity = dto.addressCity || undefined;
    if (dto.phoneNumber !== undefined) u.phoneNumber = dto.phoneNumber || undefined;
    if (dto.governmentIdUrl !== undefined) u.governmentIdUrl = dto.governmentIdUrl || undefined;
    if (dto.role !== undefined) u.role = dto.role!;
    if (dto.status !== undefined) u.status = dto.status!;

    return this.userRepository.save(u);
  }

  async findAll() {
    return this.userRepository.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  async findOne(id: string) {
    const u = await this.userRepository.findOne({ where: { id } });
    if (!u) throw new BadRequestException('user not found');
    return u;
  }

  async remove(id: string) {
    const u = await this.userRepository.findOne({ where: { id } });
    if (!u) throw new BadRequestException('user not found');
    await this.userRepository.remove(u);
    return { deleted: true, id };
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Region } from '../../entities/region.entity';
import { Party } from '../../entities/party.entity';
import { AgeGroup } from '../../enums/age-group.enum';
import { UserRole } from '../../enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Region) private readonly regions: Repository<Region>,
    @InjectRepository(Party) private readonly parties: Repository<Party>,
  ) {}

  async findByEmailOrPhone(id: string) {
    return this.users.findOne({
      where: [{ email: id }, { phone: id }],
      relations: ['region', 'supportedParty'],
    });
  }

  async findById(userId: string) {
    return this.users.findOne({ where: { id: userId }, relations: ['region', 'supportedParty'] });
  }

  async createUser(input: {
    name: string;
    nickname: string;
    ageGroup: AgeGroup;
    regionId?: string;
    phone: string;
    email: string;
    password: string;
  }) {
    const existing = await this.users.findOne({
      where: [{ email: input.email }, { phone: input.phone }, { nickname: input.nickname }],
    });
    if (existing) {
      throw new Error('User with same email/phone/nickname already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const region = input.regionId ? await this.regions.findOne({ where: { id: input.regionId } }) : null;

    const user = this.users.create({
      name: input.name,
      nickname: input.nickname,
      ageGroup: input.ageGroup,
      region: region ?? null,
      phone: input.phone,
      email: input.email,
      passwordHash,
      role: UserRole.CITIZEN,
    });
    return this.users.save(user);
  }
}
// backend/src/modules/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // エラーTS2339の修正: createメソッドを追加 (controller, seed-dataで使用)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  // エラーTS2339の修正: updateメソッドを追加 (controllerで使用)
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isActive: true }, 
      select: ['id', 'email', 'displayName', 'photoUrl', 'role', 'district', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true }, 
      select: ['id', 'email', 'displayName', 'photoUrl', 'role', 'district', 'createdAt'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }
  
  async findByFirebaseUid(firebaseUid: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { firebaseUid, isActive: true }, 
    });
    if (!user) {
      throw new NotFoundException(`User with Firebase UID "${firebaseUid}" not found`);
    }
    return user;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
        where: { email, isActive: true }, 
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false; 
    await this.userRepository.save(user);
  }

  async getStats(): Promise<any> {
    const [totalActive, totalAdmin] = await Promise.all([
      this.userRepository.count({ where: { isActive: true } }), 
      this.userRepository.count({ where: { role: 'admin', isActive: true } }), 
    ]);
    return { totalActive, totalAdmin };
  }
}
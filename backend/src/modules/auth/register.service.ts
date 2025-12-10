import { Injectable, BadRequestException } from '@nestjs/common';

type RegisterInput = {
  email: string;
  name: string;
  password: string;
  phone?: string;
  addressPrefecture?: string;
  addressCity?: string;
  licensePath?: string;
  mynumberPath?: string;
};

@Injectable()
export class RegisterService {
  private memoryUsers: Array<RegisterInput & { id: number }> = [];
  private seq = 1;

  async register(input: RegisterInput) {
    if (this.memoryUsers.some((u) => u.email === input.email)) {
      throw new BadRequestException('Email already registered');
    }
    // TODO: bcrypt でハッシュ化（今は省略）
    const user = { id: this.seq++, ...input };
    this.memoryUsers.push(user);
    return user;
  }
}
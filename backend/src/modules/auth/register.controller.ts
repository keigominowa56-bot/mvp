import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterDto } from './register.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'license', maxCount: 1 },
      { name: 'mynumber', maxCount: 1 },
    ])
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFiles()
    files: {
      license?: Express.Multer.File[];
      mynumber?: Express.Multer.File[];
    },
  ) {
    const licenseFile = files.license?.[0];
    const mynumberFile = files.mynumber?.[0];

    const user = await this.registerService.register({
      email: dto.email,
      name: dto.name,
      password: dto.password,
      phone: dto.phone,
      addressPrefecture: dto.addressPrefecture,
      addressCity: dto.addressCity,
      licensePath: licenseFile ? licenseFile.originalname : undefined, // 実運用は保存先のパス/URL
      mynumberPath: mynumberFile ? mynumberFile.originalname : undefined,
    });

    return { user, message: 'Registered successfully' };
  }
}
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from 'src/core/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import type { UserRepository } from 'src/core/index.respository';
import { Roles } from 'src/common/enum/roles.enum';
import { config } from 'src/config';
import { CryptoService } from 'src/common/crypto';
import { successRes } from 'src/infrastructure/successRes';
import { SignInDto } from './dto/sign-in.dto';
import { IToken, TokenService } from 'src/common/token';
import { Response } from 'express';
import { StatusDto } from './dto/status.dto';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { ISuccess } from 'src/infrastructure/pagination/successResponse';

@Injectable()
export class UserService
  extends BaseService<CreateUserDto, UpdateUserDto, UserEntity>
  implements OnModuleInit
{
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: UserRepository,
    private readonly crypto: CryptoService,
    private readonly token: TokenService,
  ) {
    super(userRepo);
  }

  async onModuleInit() {
    try {
      const existsAdmin = await this.userRepo.findOne({
        where: { role: Roles.ADMIN },
      });

      const hashedPassword = await this.crypto.encrypt(config.ADMIN_PASSWORD);

      if (!existsAdmin) {
        const admin = this.userRepo.create({
          fullName: config.ADMIN_FULLNAME,
          username: config.ADMIN_USERNAME,
          password: hashedPassword,
          role: Roles.ADMIN,
        });
        console.log('Admin created');

        await this.userRepo.save(admin);
      }
      console.log('Admin already exists');
    } catch (error) {}
  }

  async updatePassword(id: number, newPass: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const hashedPassword = await this.crypto.encrypt(newPass);

    await this.userRepo.update(id, { password: hashedPassword });

    return successRes({ message: 'Parol muvaffaqiyatli o‘zgartirildi' });
  }

  async createUser(createUserDto: CreateUserDto) {
    const existsUsername = await this.userRepo.findOne({
      where: { username: createUserDto.username },
    });

    if (existsUsername) throw new ConflictException('Username already exists');

    const hashedPassword = await this.crypto.encrypt(createUserDto.password);

    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    return successRes(user, 201);
  }

  async findByUsername(username: string) {
    const user = await this.userRepo.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        imageUrl: true,
        isActive: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: number, updateDto: UpdateUserDto) {
    if (updateDto.username) {
      const existsUsername = await this.userRepo.findOne({
        where: { username: updateDto.username },
      });
      if (existsUsername && existsUsername.id !== id) {
        throw new Error('Username already exists');
      }
    }

    let hashedPassword: string | undefined;
    if (updateDto.password) {
      hashedPassword = await this.crypto.encrypt(updateDto.password);
    }

    const updateData = {
      ...updateDto,
      ...(hashedPassword && { password: hashedPassword }),
    };

    await this.userRepo.update(id, updateData);

    const updatedUser = await this.userRepo.findOne({ where: { id } });

    return successRes(updatedUser);
  }

  async signIn(dto: SignInDto, res: Response) {
    const { username, password, role } = dto;

    const user = await this.userRepo.findOne({ where: { username } });

    if (!user) {
      throw new BadRequestException('Username or password incorrect');
    }

    if (!password || !user.password) {
      throw new BadRequestException('Password is required');
    }

    const isMatchPassword = await this.crypto.decrypt(password, user.password);

    if (!isMatchPassword) {
      throw new BadRequestException('Username or password incorrect');
    }

    if (user.role !== role) {
      throw new BadRequestException('User role mismatch');
    }

    const payload: IToken = {
      id: user.id,
      role: user.role,
      isActive: user.isActive,
    };

    const accessToken = await this.token.accessToken(payload);
    const refreshToken = await this.token.refreshToken(payload);
    await this.token.writeCookie(res, 'refresh_token', refreshToken, 15);
    return successRes({
      accessToken,
      role,
    });
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id: id },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        imageUrl: true,
        isActive: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateStatusIsActive(id: number, dto: StatusDto) {
    const teacher = await this.userRepo.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException('User not found');
    }

    teacher.isActive = dto.isActive;

    await this.userRepo.save(teacher);

    return {
      message: `Teacher status updated to ${dto.isActive ? 'Active' : 'Blocked'}`,
      teacher,
    };
  }

  async updateAvatar(id: number, file: Express.Multer.File): Promise<ISuccess> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', 404);

    const relativeUrl = `/uploads/${file.filename}`;
    const avatarUrl = `http://localhost:3000/api/v1${relativeUrl}`;

    if (user.imageUrl) {
      const oldFilePath = join(process.cwd(), user.imageUrl);
      if (existsSync(oldFilePath)) {
        unlinkSync(oldFilePath);
      }
    }

    user.image = avatarUrl;
    user.imageUrl = relativeUrl;

    const updatedUser = await this.userRepo.save(user);

    return successRes(updatedUser);
  }
}

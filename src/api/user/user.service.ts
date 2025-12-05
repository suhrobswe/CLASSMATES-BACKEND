import {
  BadRequestException,
  ConflictException,
  Injectable,
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
import { successRes } from 'src/infrastructure/successRe';
import { SignInDto } from './dto/sign-in.dto';
import { IToken, TokenService } from 'src/common/token';
import { Response } from 'express';

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

        await this.userRepo.save(admin);
      }
    } catch (error) {
      // throw new InternalServerErrorException('Error on creating SUPER ADMIN');
    }
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
    const { username, password } = dto;

    const user = await this.userRepo.findOne({ where: { username } });
    const isMatchPassword = await this.crypto.decrypt(
      password,
      user?.password!,
    );

    if (!user || !isMatchPassword)
      throw new BadRequestException('Username or password incorrect');

    const payload: IToken = {
      id: user.id,
      role: user.role,
      isActive: user.isActive,
    };

    const accessToken = await this.token.accessToken(payload);
    const refreshToken = await this.token.refreshToken(payload);
    await this.token.writeCookie(res, 'token', refreshToken, 15);

    return successRes(accessToken);
  }
}

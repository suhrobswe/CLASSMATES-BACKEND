import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CryptoService } from 'src/common/crypto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/core/user.entity';
import { TokenService } from 'src/common/token';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, CryptoService, TokenService],
  exports: [UserService],
})
export class UserModule {}

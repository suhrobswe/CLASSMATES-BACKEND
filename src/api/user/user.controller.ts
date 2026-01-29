import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpException,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserEntity } from 'src/core/user.entity';
import { accessRoles } from 'src/common/decorator/role.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { SignInDto } from './dto/sign-in.dto';
import type { Response } from 'express';
import { StatusDto } from './dto/status.dto';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { IToken } from 'src/common/token';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.signIn(signInDto, res);
  }

  @accessRoles(Roles.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserEntity,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN, Roles.STUDENT)
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserEntity],
  })
  findAll() {
    return this.userService.findAll({ order: { username: 'DESC' } });
  }

  @ApiBearerAuth()
  @Patch('password')
  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN, Roles.STUDENT)
  @ApiOperation({ summary: "Foydalanuvchi parolini o'zgartirish" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { newPassword: { type: 'string', example: '12345' } },
    },
  })
  updatePassword(@CurrentUser() user: IToken, @Body() body: any) {
    const newPass = body.newPassword || body.password;

    if (!newPass) {
      throw new BadRequestException('Yangi parol (newPassword) yuborilmadi!');
    }

    return this.userService.updatePassword(+user.id, newPass);
  }

  @Patch('status/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
  @ApiOperation({ summary: 'Change user status' })
  updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.userService.updateStatusIsActive(+id, dto);
  }

  @Patch('image/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new HttpException('Only images are allowed', 400), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async updateAvatarUser(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new HttpException('File is required', 400);
    return this.userService.updateAvatar(+id, file);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Find by Username' })
  async findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN, Roles.STUDENT)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!isNaN(+id)) {
      return this.userService.findOneById(+id);
    }

    return this.userService.findByUsername(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN, Roles.STUDENT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserEntity,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(+id, updateUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.userService.delete(+id);
  }
}

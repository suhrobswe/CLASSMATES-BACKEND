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
  Req,
  BadRequestException,
  HttpException,
  UploadedFile,
  UseInterceptors,
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
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { IToken } from 'src/common/token';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
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

  @Post('login')
  signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.signIn(signInDto, res);
  }

  // @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
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

  // getProfile(@CurrentUser() user: IToken) {
  //   return this.userService.findOneById(user.id, {
  //     select: {
  //       id: true,
  //       username: true,
  //       fullName: true,
  //       role: true,
  //       createdAt: true,
  //       updatedAt: true,
  //     },
  //   });
  // }

  // GET /users/username/:username
  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  // @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
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

  @Patch('status/:id')
  @ApiBearerAuth()
  @accessRoles(Roles.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.userService.updateStatusIsActive(+id, dto);
  }
  @Patch('image/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads', // faylni qayerga saqlash
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
  // @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.userService.delete(+id);
  }
}

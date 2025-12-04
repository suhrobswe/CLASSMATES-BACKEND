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
} from '@nestjs/swagger';
import { UserEntity } from 'src/core/user.entity';
import { accessRoles } from 'src/common/decorator/role.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { SignInDto } from './dto/sign-in.dto';
import type { Response } from 'express';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard, RolesGuard)
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

  @UseGuards(AuthGuard, RolesGuard)
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

  // @UseGuards(AuthGuard)
  // @Get('me')
  // getMe(@Req() req: any) {
  //   const userId = Number(req.user?.id);
  //   if (isNaN(userId)) {
  //     throw new BadRequestException('Invalid user ID in token');
  //   }
  //   return this.userService.findOneById(userId);
  // }

  @UseGuards(AuthGuard, RolesGuard)
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

  @UseGuards(AuthGuard, RolesGuard)
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

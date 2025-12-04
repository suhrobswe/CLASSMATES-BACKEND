import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/common/enum/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'suhrob_2009',
    description: 'Unique username for the user',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'Suhrob Abdullaev',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '/uploads/avatar.png',
    description: 'Local image path',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: 'http://localhost:4000/uploads/avatar.png',
    description: 'Public image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: Roles.ADMIN,
    enum: Roles,
    description: 'User role',
  })
  @IsEnum(Roles)
  role: Roles;

  @ApiProperty({
    example: true,
    description: 'User active status',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

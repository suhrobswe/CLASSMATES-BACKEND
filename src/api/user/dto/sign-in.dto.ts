import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Roles } from 'src/common/enum/roles.enum';

export class SignInDto {
  @ApiProperty({ example: 'suhrobswe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Suhrob1222!' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: Roles.ADMIN })
  @IsNotEmpty()
  role: string;
}

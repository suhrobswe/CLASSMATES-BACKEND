import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'suhrobswe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Suhrob1222!' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

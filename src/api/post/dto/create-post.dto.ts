import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the post',
    example: 'My first post',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
}

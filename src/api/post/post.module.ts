import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/core/post.entity';
import { FileService } from 'src/infrastructure/file/file.service';
import { FileModule } from 'src/infrastructure/file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), FileModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}

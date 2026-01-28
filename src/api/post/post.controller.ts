import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { PostEntity } from 'src/core/post.entity';
import { accessRoles } from 'src/common/decorator/role.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { multerMemoryOptions } from 'src/infrastructure/file/multer.config';

@ApiTags('Posts')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, multerMemoryOptions))
  create(
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postService.createPost(dto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, type: [PostEntity] })
  findAll() {
    return this.postService.findAllPosts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: PostEntity })
  findOne(@Param('id') id: string) {
    return this.postService.findPostById(+id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 10, multerMemoryOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postService.updatePost(+id, dto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.deletePost(+id);
  }
}

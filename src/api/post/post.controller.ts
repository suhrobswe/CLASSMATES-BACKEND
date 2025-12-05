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
import { multerOptions } from 'src/infrastructure/file/file.service';
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

@ApiTags('Posts')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiOperation({ summary: 'Create a new post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'My First Post' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: PostEntity })
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postService.createPost(createPostDto, files);
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

  @UseGuards(AuthGuard, RolesGuard)
  @accessRoles(Roles.ADMIN)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Title' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: PostEntity })
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postService.updatePost(+id, updatePostDto, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  remove(@Param('id') id: string) {
    return this.postService.deletePost(+id);
  }
}

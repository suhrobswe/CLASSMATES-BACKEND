import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import type { Express } from 'express';
import { VideoService } from './video.service';
import { accessRoles } from 'src/common/decorator/role.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Videos')
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @accessRoles(Roles.ADMIN)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', new VideoService().getMulterOptions()),
  )
  @ApiOperation({
    summary: 'Upload a video (max 60s)',
    description:
      'Only video files are allowed. Max size: ~50MB (~40-60 seconds).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload video file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file (mp4, mov, etc.)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video uploaded successfully',
    schema: {
      example: { url: 'http://localhost:3000/uploads/videos/file-123456.mp4' },
    },
  })
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.videoService.saveVideo(file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all uploaded videos' })
  @ApiResponse({ status: 200, description: 'List of videos' })
  async getVideos() {
    return this.videoService.getAllVideos();
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import { config } from 'src/config';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readdirSync } from 'fs';

const SERVER_URL = config.BASE_URL;

@Injectable()
export class VideoService {
  async saveVideo(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Video fayl yuklanmadi');

    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Faqat video fayllar yuklanadi');
    }

    return {
      url: `${SERVER_URL}/uploads/videos/${file.filename}`,
    };
  }

  getMulterOptions() {
    return {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          cb(new BadRequestException('Faqat video fayllar yuklanadi'), false);
        } else {
          cb(null, true);
        }
      },
    };
  }

  private videosPath = join(process.cwd(), 'uploads/videos');

  async getAllVideos() {
    try {
      const files = readdirSync(this.videosPath);
      return files
        .filter((file) => file.endsWith('.mp4') || file.endsWith('.mov'))
        .map((file) => ({
          filename: file,
          url: `${SERVER_URL}/uploads/videos/${file}`,
        }));
    } catch (err) {
      return [];
    }
  }
}

import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { writeFile, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid'; 

@Injectable()
export class FileService {
  private uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      this.validateFile(file);

      const fileName = `${uuidv4()}${extname(file.originalname)}`;
      const fullPath = join(this.uploadDir, fileName);

      await writeFile(fullPath, file.buffer);

      return fileName;
    } catch (error) {
      throw new InternalServerErrorException(
        `Fayl yozishda xatolik: ${error.message}`,
      );
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      if (!fileName) return;

      const fullPath = join(this.uploadDir, fileName);

      if (existsSync(fullPath)) {
        await unlink(fullPath);
      }
    } catch (error) {
      console.error(`Fayl o'chirishda xatolik: ${error.message}`);
    }
  }

  private validateFile(file: Express.Multer.File) {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf|mp4|mov)$/)) {
    }
  }
}

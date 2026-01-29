import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/core/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileService } from 'src/infrastructure/file/file.service';
import { config } from 'src/config';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    private readonly fileService: FileService,
  ) {}

  async createPost(dto: CreatePostDto, files: Express.Multer.File[]) {
    const { images, videos } = await this.uploadAndSplitFiles(files);
    const post = this.postRepo.create({ ...dto, images, videos });
    return this.mapResponse(await this.postRepo.save(post));
  }

  async updatePost(
    id: number,
    dto: UpdatePostDto,
    files: Express.Multer.File[],
  ) {
    const post = await this.findPostEntity(id);

    if (files && files.length > 0) {
      const { images, videos } = await this.uploadAndSplitFiles(files);
      post.images = [...(post.images || []), ...images];
      post.videos = [...(post.videos || []), ...videos];
    }

    Object.assign(post, dto);
    return this.mapResponse(await this.postRepo.save(post));
  }

  async replacePostFile(
    id: number,
    oldFileUrl: string,
    newFile: Express.Multer.File,
  ) {
    const post = await this.findPostEntity(id);
    const oldFileName = this.extractFileName(oldFileUrl);

    const imgIndex = post.images?.indexOf(oldFileName);
    if (imgIndex !== undefined && imgIndex > -1) {
      await this.fileService.deleteFile(oldFileName);
      const newFileName = await this.fileService.saveFile(newFile);
      post.images[imgIndex] = newFileName;
    } else {
      const vidIndex = post.videos?.indexOf(oldFileName);
      if (vidIndex !== undefined && vidIndex > -1) {
        await this.fileService.deleteFile(oldFileName);
        const newFileName = await this.fileService.saveFile(newFile);
        post.videos[vidIndex] = newFileName;
      } else {
        throw new NotFoundException('Almashtiriladigan fayl topilmadi');
      }
    }

    return this.mapResponse(await this.postRepo.save(post));
  }

  async deletePostFile(id: number, fileUrl: string) {
    const post = await this.findPostEntity(id);
    const fileName = this.extractFileName(fileUrl);
    let fileDeleted = false;

    if (post.images && post.images.includes(fileName)) {
      post.images = post.images.filter((img) => img !== fileName);
      fileDeleted = true;
    } else if (post.videos && post.videos.includes(fileName)) {
      post.videos = post.videos.filter((vid) => vid !== fileName);
      fileDeleted = true;
    }

    if (fileDeleted) {
      await this.fileService.deleteFile(fileName);
      await this.postRepo.save(post);
      return { message: "Fayl muvaffaqiyatli o'chirildi" };
    }

    throw new NotFoundException('Fayl post ichidan topilmadi');
  }

  async deletePost(id: number) {
    const post = await this.findPostEntity(id);
    await this.deletePostFiles(post);
    await this.postRepo.remove(post);
    return { message: "Post va barcha fayllar o'chirildi" };
  }

  async findAllPosts() {
    const posts = await this.postRepo.find({ order: { createdAt: 'DESC' } });
    return posts.map((post) => this.mapResponse(post));
  }

  async findPostById(id: number) {
    return this.mapResponse(await this.findPostEntity(id));
  }

  private async findPostEntity(id: number): Promise<PostEntity> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post topilmadi');
    return post;
  }

  private async uploadAndSplitFiles(files: Express.Multer.File[]) {
    const images: string[] = [];
    const videos: string[] = [];
    if (!files || files.length === 0) return { images, videos };

    const uploadPromises = files.map(async (file) => {
      const fileName = await this.fileService.saveFile(file);
      if (file.mimetype.startsWith('image/')) images.push(fileName);
      else if (file.mimetype.startsWith('video/')) videos.push(fileName);
    });

    await Promise.all(uploadPromises);
    return { images, videos };
  }

  private async deletePostFiles(post: PostEntity) {
    const allFiles = [...(post.images || []), ...(post.videos || [])];
    await Promise.all(
      allFiles.map((fileName) => this.fileService.deleteFile(fileName)),
    );
  }

  private extractFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/uploads/');
    return parts.length > 1 ? parts[1] : url;
  }

  private mapResponse(post: PostEntity) {
    return {
      ...post,
      images: post.images?.map((img) => this.formatUrl(img)) || [],
      videos: post.videos?.map((vid) => this.formatUrl(vid)) || [],
    };
  }

  private formatUrl(fileName: string): string {
    if (!fileName) return '';
    if (fileName.startsWith('http')) return fileName;
    return `${config.BASE_URL}/uploads/${fileName}`;
  }
}

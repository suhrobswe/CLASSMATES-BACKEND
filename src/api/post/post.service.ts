import { Injectable, NotFoundException } from '@nestjs/common';
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
    const savedPost = await this.postRepo.save(post);

    return this.mapResponse(savedPost);
  }

  async updatePost(
    id: number,
    dto: UpdatePostDto,
    files: Express.Multer.File[],
  ) {
    const post = await this.findPostEntity(id);

    if (files && files.length > 0) {
      await this.deletePostFiles(post);

      const { images, videos } = await this.uploadAndSplitFiles(files);
      post.images = images;
      post.videos = videos;
    }

    Object.assign(post, dto);
    const updatedPost = await this.postRepo.save(post);

    return this.mapResponse(updatedPost);
  }

  async deletePost(id: number) {
    const post = await this.findPostEntity(id);

    await this.deletePostFiles(post);

    await this.postRepo.remove(post);

    return { message: "Post va uning fayllari muvaffaqiyatli o'chirildi" };
  }

  async findAllPosts() {
    const posts = await this.postRepo.find({ order: { createdAt: 'DESC' } });
    return posts.map((post) => this.mapResponse(post));
  }

  async findPostById(id: number) {
    const post = await this.findPostEntity(id);
    return this.mapResponse(post);
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
      allFiles.map((fileUrl) => {
        const fileName = fileUrl.split('/').pop();
        if (fileName) {
          return this.fileService.deleteFile(fileName);
        }
      }),
    );
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

    const cleanName = fileName.replace(/^(\/|\\)?uploads(\/|\\)/, '');

    return `${config.BASE_URL}/uploads/${cleanName}`;
  }
}

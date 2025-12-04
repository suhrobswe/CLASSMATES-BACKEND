import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/infrastructure/base/base.service';
import { PostEntity } from 'src/core/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express';
import { config } from 'src/config';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const SERVER_URL = config.BASE_URL;

@Injectable()
export class PostService extends BaseService<
  CreatePostDto,
  UpdatePostDto,
  PostEntity
> {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
  ) {
    super(postRepo);
  }

  async createPost(createPostDto: CreatePostDto, files: Express.Multer.File[]) {
    const images: string[] = [];
    const videos: string[] = [];

    files.forEach((file) => {
      const path = `/uploads/${file.filename}`;
      if (file.mimetype.startsWith('image/')) images.push(path);
      else if (file.mimetype.startsWith('video/')) videos.push(path);
    });

    const post = this.postRepo.create({ ...createPostDto, images, videos });
    const savedPost = await this.postRepo.save(post);

    return {
      ...savedPost,
      images: savedPost.images?.map((img) => `${SERVER_URL}${img}`) || [],
      videos: savedPost.videos?.map((vid) => `${SERVER_URL}${vid}`) || [],
    };
  }

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    files: Express.Multer.File[],
  ) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const images = post.images || [];
    const videos = post.videos || [];

    files.forEach((file) => {
      const path = `/uploads/${file.filename}`;
      if (file.mimetype.startsWith('image/')) images.push(path);
      else if (file.mimetype.startsWith('video/')) videos.push(path);
    });

    Object.assign(post, updatePostDto, { images, videos });

    const savedPost = await this.postRepo.save(post);

    return {
      ...savedPost,
      images: savedPost.images?.map((img) => `${SERVER_URL}${img}`) || [],
      videos: savedPost.videos?.map((vid) => `${SERVER_URL}${vid}`) || [],
    };
  }

  async findAllPosts() {
    const posts = await this.postRepo.find({ order: { createdAt: 'DESC' } });
    return posts.map((p) => ({
      ...p,
      images: p.images?.map((img) => `${SERVER_URL}${img}`) || [],
      videos: p.videos?.map((vid) => `${SERVER_URL}${vid}`) || [],
    }));
  }

  async findPostById(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    return {
      ...post,
      images: post.images?.map((img) => `${SERVER_URL}${img}`) || [],
      videos: post.videos?.map((vid) => `${SERVER_URL}${vid}`) || [],
    };
  }

  async deletePost(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    await this.postRepo.remove(post);
    return { message: 'Post deleted successfully' };
  }
}

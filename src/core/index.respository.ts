import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

export type UserRepository = Repository<UserEntity>;

export type PostRepository = Repository<PostRepository>;

import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('post')
export class PostEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column('text', { array: true, nullable: true })
  videos: string[];
}

import { Column, Entity } from 'typeorm';
import { Roles } from '../common/enum/roles.enum';
import { BaseEntity } from './base.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  fullName: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'enum', enum: Roles })
  role: Roles;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

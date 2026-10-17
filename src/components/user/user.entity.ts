import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from './user.enum';

/**
 * A login identity. Users are global: the same user can be staff in, or a
 * patient of, more than one organization.
 */
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  email: string;

  /** Never loaded unless explicitly selected. */
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Index()
  @Column({ type: 'enum', enum: Object.values(UserType) })
  type: UserType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

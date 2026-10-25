import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus, UserType } from './user.enum';
import { Department } from '../department/department.entity';

/**
 * A login identity. Users are global: the same user can be staff in, or a
 * patient of, more than one organization.
 */
@Unique(['email', 'organizationId'])
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  firstName: string;

  @Column({ type: 'varchar', length: 60 })
  lastName: string;

  @Column({ type: 'varchar', length: 80 })
  email: string;

  /** Never loaded unless explicitly selected. */
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  /** Null for users not assigned to a department (e.g. admins). */
  @Index()
  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @Index()
  @Column({ type: 'enum', enum: Object.values(UserType) })
  type: UserType;

  @Index()
  @Column({
    type: 'enum',
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: true })
  passwordResetRequired: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /** A department with users can't be deleted. */
  @ManyToOne(() => Department, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'departmentId' })
  department: Department | null;
}

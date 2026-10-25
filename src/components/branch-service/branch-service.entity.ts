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
import { Branch } from '../branch/branch.entity';
import { Service } from '../service/service.entity';
import { BranchServiceStatus } from './branch-service.enum';

/** Postgres returns `numeric` as a string; expose it as a number. */
const decimalToNumber = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

/**
 * A service offered at one branch, with that branch's own price and
 * availability. One row per (branch, service). See prd/service.md.
 */
@Unique(['branchId', 'serviceId'])
@Entity({ name: 'branch_services' })
export class BranchService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  /** Indexed through the unique (branchId, serviceId) constraint. */
  @Column({ type: 'uuid' })
  branchId: string;

  @Index()
  @Column({ type: 'uuid' })
  serviceId: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalToNumber,
  })
  price: number;

  /** Inactive: the branch doesn't currently offer this service. */
  @Index()
  @Column({
    type: 'enum',
    enum: Object.values(BranchServiceStatus),
    default: BranchServiceStatus.ACTIVE,
  })
  status: BranchServiceStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /** A branch with prices can't be deleted. */
  @ManyToOne(() => Branch, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  /** A service priced in a branch can't be deleted. */
  @ManyToOne(() => Service, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;
}

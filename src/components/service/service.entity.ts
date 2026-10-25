import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceStatus } from './service.enum';

/**
 * A service (consultation, X-ray, maternity, ...). System-generated services
 * have no organization and are available to every organization; the others
 * belong to one organization. Each branch sets its own price and availability
 * in `branch_services`. See prd/service.md.
 */
@Check(
  `("isSystemGenerated" AND "organizationId" IS NULL) OR (NOT "isSystemGenerated" AND "organizationId" IS NOT NULL)`,
)
@Entity({ name: 'services' })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Null for system-generated services. */
  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  /** System-generated services can't be updated or deleted by organizations. */
  @Index()
  @Column({ type: 'boolean', default: false })
  isSystemGenerated: boolean;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Inactive: no longer available in the system (system-generated) or at the organization. */
  @Index()
  @Column({
    type: 'enum',
    enum: Object.values(ServiceStatus),
    default: ServiceStatus.ACTIVE,
  })
  status: ServiceStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

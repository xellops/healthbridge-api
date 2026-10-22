import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  OrganizationLevel,
  OrganizationOwnership,
  OrganizationStatus,
} from './organization.enum';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** A short string */
  @Column({ type: 'varchar', length: 100 })
  clientId: string;

  /** Never loaded unless explicitly selected. */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Never loaded unless explicitly selected. */
  @Column({ type: 'varchar', length: 80 })
  email: string;

  /** Never loaded unless explicitly selected. */
  @Column({ type: 'varchar', length: 18, nullable: true })
  phone: string;

  @Index()
  @Column({ type: 'enum', enum: Object.values(OrganizationOwnership) })
  ownership: OrganizationOwnership;

  @Index()
  @Column({ type: 'enum', enum: Object.values(OrganizationLevel) })
  level: OrganizationLevel;

  @Index()
  @Column({
    type: 'enum',
    enum: Object.values(OrganizationStatus),
    default: OrganizationStatus.INACTIVE,
  })
  status: OrganizationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

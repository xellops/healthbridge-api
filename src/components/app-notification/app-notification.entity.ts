import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ResourceType } from '../../shared/enums/resource.enum';
import { AppNotificationRecipient } from '../app-notification-recipient/app-notification-recipient.entity';

@Entity({ name: 'app_notifications' })
export class AppNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Null for account-level notifications (e.g. a new login). */
  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Index()
  @Column({ type: 'uuid' })
  resourceId: string;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  resourceType: ResourceType;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(
    () => AppNotificationRecipient,
    (recipient) => recipient.notification,
  )
  recipients: AppNotificationRecipient[];
}

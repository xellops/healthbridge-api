import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppNotification } from '../app-notification/app-notification.entity';
import { User } from '../user/user.entity';
import { AppNotificationRecipientStatus } from './app-notification-recipient.interface';

@Entity({ name: 'app_notification_recipients' })
export class AppNotificationRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Index()
  @Column({ type: 'uuid' })
  notificationId: string;

  @Index()
  @Column({ type: 'uuid' })
  batchId: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 6,
    default: AppNotificationRecipientStatus.UNREAD,
  })
  status: AppNotificationRecipientStatus;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => AppNotification, (notification) => notification.recipients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notificationId' })
  notification: AppNotification;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JobQueueList } from '../../shared/enums/queue.enum';
import { MailWorker } from './mail.worker';
import { MailService } from './mail.service';

@Module({
  imports: [BullModule.registerQueue({ name: JobQueueList.MAIL })],
  providers: [MailService, MailWorker],
  exports: [MailService],
})
export class MailModule {}

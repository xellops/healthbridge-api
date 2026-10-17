import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobQueueList } from '../../shared/enums/queue.enum';
import { MailService } from './mail.service';
import { SendOption } from './mail.interface';

@Processor(JobQueueList.MAIL)
export class MailWorker extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendOption>) {
    await this.mailService.send(job.data);
  }
}

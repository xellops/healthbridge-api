import { Global, Module } from '@nestjs/common';
import { EventManagerService } from './event-manager.service';

@Global()
@Module({
  providers: [EventManagerService],
  exports: [EventManagerService],
})
export class EventManagerModule {}

import { Injectable } from '@nestjs/common';

/**
 * The single place services publish events through. Emit once the change is
 * committed, passing the resource the change affected.
 */
@Injectable()
export class EventManagerService {
  emit<T>(_event: string, _resource: T): void {
    // TODO: decide what happens to an emitted event (socket broadcast, audit log, queue).
  }
}

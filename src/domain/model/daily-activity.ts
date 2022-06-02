import { Either } from '@util/types';
import { availableCommands, nextStatus } from './work-command';
import { WorkEvent } from './work-event';
import { WorkStatus } from './work-status';
import { Minute } from './date';

export class DailyActivity {
  private constructor(private daily: WorkEvent[]) {}

  private get firstEvent(): WorkEvent | undefined {
    return this.daily[0];
  }

  private get lastEvent(): WorkEvent | undefined {
    return this.daily[this.daily.length - 1];
  }

  get lastTimestamp(): Minute | undefined {
    return this.firstEvent?.timestamp || undefined;
  }

  get startedAt(): Minute | undefined {
    return this.firstEvent?.timestamp || undefined;
  }
  get finishedAt(): Minute | undefined {
    return this.lastEvent?.timestamp || undefined;
  }

  getCurrentStatus(): WorkStatus {
    const lastEvent = this.lastEvent;
    if (lastEvent === undefined) return 'beforeWork';
    else return nextStatus(lastEvent.command);
  }

  addEvent(event: WorkEvent): Either<WorkStatus> {
    const [_canAdd, invalidErr] = isAvailableEvent(this.getCurrentStatus(), this.lastTimestamp, event);

    if (invalidErr) {
      return [undefined, invalidErr];
    }

    this.daily.push(event);
    return [this.getCurrentStatus(), undefined];
  }

  getEvents(): WorkEvent[] {
    return [...this.daily];
  }

  static fromEvents(events: WorkEvent[]): Either<DailyActivity> {
    const [status, error] = getCurrentStatus(events);
    if (error) {
      return [undefined, error];
    }

    return [new DailyActivity([...events]), undefined];
  }

  static new(): DailyActivity {
    return new DailyActivity([]);
  }
}

const getCurrentStatus = (events: WorkEvent[]): Either<WorkStatus> => {
  const [firstEvent, ...remEvents] = events;
  if (firstEvent === undefined) {
    return ['beforeWork', undefined];
  }

  if (firstEvent.command !== 'startWork') {
    return [undefined, new Error('first command must be "startWork"')];
  }

  let status: WorkStatus = 'working';
  let lastTimestamp = firstEvent.timestamp;
  for (const event of remEvents) {
    if (!availableCommands(status).includes(event.command)) {
      return [undefined, new Error('invalid command')];
    }
    if (!event.timestamp.isAfter(lastTimestamp)) {
      return [undefined, new Error('invalid timestamp')];
    }

    lastTimestamp = event.timestamp;
    status = nextStatus(event.command);
  }

  return [status, undefined];
};

const isAvailableEvent = (
  status: WorkStatus,
  lastTimestamp: Minute | undefined,
  addedEvent: WorkEvent,
): Either<true> => {
  if (!availableCommands(status).includes(addedEvent.command)) {
    return [undefined, new Error('invalid command')];
  }

  if (lastTimestamp && !addedEvent.timestamp.isAfter(lastTimestamp)) {
    return [undefined, new Error('invalid timestamp')];
  }

  return [true, undefined];
};

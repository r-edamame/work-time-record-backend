import { Either } from '@util/types';
import { availableCommands, nextStatus } from './work-command';
import { WorkEvent } from './work-event';
import { WorkStatus } from './work-status';
import { Day, Minute } from './date';

export class DailyActivity {
  private constructor(private _workerId: string, private _day: Day, private daily: WorkEvent[]) {}

  get workerId(): string {
    return this._workerId;
  }
  get day(): Day {
    return this._day;
  }

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
    const [_canAdd, invalidErr] = isAvailableEvent(this.day, this.getCurrentStatus(), this.lastTimestamp, event);

    if (invalidErr) {
      return [undefined, invalidErr];
    }

    this.daily.push(event);
    return [this.getCurrentStatus(), undefined];
  }

  getEvents(): WorkEvent[] {
    return [...this.daily];
  }

  static fromEvents(workerId: string, day: Day, events: WorkEvent[]): Either<DailyActivity> {
    const activity = DailyActivity.new(workerId, day);
    for (const event of events) {
      const [_status, error] = activity.addEvent(event);
      if (error) {
        return [undefined, error];
      }
    }
    return [activity, undefined];
  }

  static new(workerId: string, day: Day): DailyActivity {
    return new DailyActivity(workerId, day, []);
  }
}

const isAvailableEvent = (
  day: Day,
  status: WorkStatus,
  lastTimestamp: Minute | undefined,
  addedEvent: WorkEvent,
): Either<true> => {
  if (
    (!lastTimestamp && !day.in(addedEvent.timestamp)) ||
    (lastTimestamp && !addedEvent.timestamp.isAfter(lastTimestamp))
  ) {
    return [undefined, new Error('invalid timestamp')];
  }

  if (!availableCommands(status).includes(addedEvent.command)) {
    return [undefined, new Error('invalid command')];
  }

  return [true, undefined];
};

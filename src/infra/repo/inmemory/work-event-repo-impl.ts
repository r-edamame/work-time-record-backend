import { DailyActivity, WorkEvent } from '@domain/model/work-event';
import { WorkEventRepo } from '@domain/repo/work-event-repo';
import { removeWithIndicies } from '@util/array';
import { Dayjs } from 'dayjs';

type RawWorkEvent = WorkEvent & { workerId: string };

class InMemoryWorkEventRepo implements WorkEventRepo {
  workEvents: RawWorkEvent[];

  constructor() {
    this.workEvents = [];
  }

  async getDailyActivity(workerId: string, date: Dayjs): Promise<DailyActivity> {
    const events = this.workEvents
      .filter((e) => {
        return e.workerId === workerId && e.timestamp.isSame(date, 'day');
      })
      .sort((a, b) => {
        return a.timestamp.diff(b.timestamp);
      });

    return {
      daily: events,
    };
  }

  async saveDailyActivity(workerId: string, activity: DailyActivity): Promise<true> {
    if (activity.daily.length <= 0) return true;

    const date = activity.daily[0].timestamp;

    const events = this.workEvents
      .map((e, ix): [RawWorkEvent, number] => [e, ix])
      .filter(([e, ix]) => {
        return e.workerId === workerId && e.timestamp.isSame(date, 'day');
      });

    const same = (a: WorkEvent, b: WorkEvent): boolean => a.command === b.command && a.timestamp.isSame(b.timestamp);

    const unsavedEvents = activity.daily.filter((e) => {
      return events.find(([d, ix]) => same(e, d)) === undefined;
    });
    const lostEvents = events.filter(([e, ix]) => {
      return activity.daily.find((d) => same(e, d)) === undefined;
    });

    this.workEvents = removeWithIndicies(
      this.workEvents,
      lostEvents.map(([e, ix]) => ix),
    );
    this.workEvents.push(
      ...unsavedEvents.map((e) => {
        return { ...e, workerId };
      }),
    );

    return true;
  }
}

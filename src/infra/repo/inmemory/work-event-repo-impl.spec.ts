import { DailyActivity } from '@domain/model/daily-activity';
import { InMemoryWorkEventRepo } from './work-event-repo-impl';
import { Worker } from '@domain/model/worker';
import { WorkEvent } from '@domain/model/work-event';
import { Between, Day, Minute, Month } from '@domain/model/date';

describe('InMemoryWorkEventRepo', () => {
  let repo: InMemoryWorkEventRepo;

  beforeEach(() => {
    repo = new InMemoryWorkEventRepo();
  });

  const forceFromEvents = (events: WorkEvent[]): DailyActivity => {
    const [activity, error] = DailyActivity.fromEvents(events);
    if (error) throw error;
    return activity;
  };

  it('can save and retrieve dailyActivity', async () => {
    const worker = Worker.createWorker('test-save');
    const activity: DailyActivity = forceFromEvents([
      { command: 'startWork', timestamp: Minute.fromDateString('2022-05-22T10:30:00') },
      { command: 'startRest', timestamp: Minute.fromDateString('2022-05-22T13:00:00') },
      { command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-22T14:30:00') },
      { command: 'finishWork', timestamp: Minute.fromDateString('2022-05-22T18:30:00') },
    ]);

    const result = await repo.saveDailyActivity(worker.id, activity);
    expect(result).toBe(true);

    const retrieved = await repo.getDailyActivity(worker.id, Day.fromDateString('2022-05-22T00:00:00'));
    const events = retrieved.getEvents();
    expect(events.length).toEqual(4);
    events.forEach((ev, ix) => {
      expect(events[ix].command).toEqual(ev.command);
      expect(events[ix].timestamp.isSame(ev.timestamp)).toBe(true);
    });
  });

  it('can update dailyActivity', async () => {
    const worker = Worker.createWorker('test-update');
    const activity: DailyActivity = forceFromEvents([
      { command: 'startWork', timestamp: Minute.fromDateString('2022-05-21T10:30:00') },
      { command: 'startRest', timestamp: Minute.fromDateString('2022-05-21T13:00:00') },
      { command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-21T14:30:00') },
      { command: 'finishWork', timestamp: Minute.fromDateString('2022-05-21T18:30:00') },
    ]);

    await repo.saveDailyActivity(worker.id, activity);

    const restingChanged: DailyActivity = forceFromEvents([
      { command: 'startWork', timestamp: Minute.fromDateString('2022-05-21T10:30:00') },
      { command: 'startRest', timestamp: Minute.fromDateString('2022-05-21T14:00:00') },
      { command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-21T15:30:00') },
      { command: 'finishWork', timestamp: Minute.fromDateString('2022-05-21T18:30:00') },
    ]);

    await repo.saveDailyActivity(worker.id, restingChanged);

    const retrieved = await repo.getDailyActivity(worker.id, Day.fromDateString('2022-05-21T23:59:59'));
    const events = retrieved.getEvents();

    expect(events.length).toEqual(4);
    events.forEach((ev, ix) => {
      expect(events[ix].command).toEqual(ev.command);
      expect(events[ix].timestamp.isSame(ev.timestamp)).toBe(true);
    });
  });

  it('can list dailyActivities', async () => {
    const worker1 = Worker.createWorker('worker1');
    const worker2 = Worker.createWorker('worker2');

    const worker1_0531: (WorkEvent & { workerId: string })[] = [
      { workerId: worker1.id, command: 'startWork', timestamp: Minute.fromDateString('2022-05-31T10:00') },
      { workerId: worker1.id, command: 'startRest', timestamp: Minute.fromDateString('2022-05-31T13:00') },
      { workerId: worker1.id, command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-31T14:30') },
      { workerId: worker1.id, command: 'finishWork', timestamp: Minute.fromDateString('2022-05-31T17:00') },
    ];
    const worker1_0601: (WorkEvent & { workerId: string })[] = [
      //
      { workerId: worker1.id, command: 'startWork', timestamp: Minute.fromDateString('2022-06-01T10:00') },
      { workerId: worker1.id, command: 'startRest', timestamp: Minute.fromDateString('2022-06-01T13:00') },
      { workerId: worker1.id, command: 'resumeWork', timestamp: Minute.fromDateString('2022-06-01T14:30') },
      { workerId: worker1.id, command: 'finishWork', timestamp: Minute.fromDateString('2022-06-01T17:00') },
    ];
    const worker2_0604: (WorkEvent & { workerId: string })[] = [
      //
      { workerId: worker2.id, command: 'startWork', timestamp: Minute.fromDateString('2022-06-04T10:00') },
      { workerId: worker2.id, command: 'startRest', timestamp: Minute.fromDateString('2022-06-04T13:00') },
      { workerId: worker2.id, command: 'resumeWork', timestamp: Minute.fromDateString('2022-06-04T14:30') },
      { workerId: worker2.id, command: 'finishWork', timestamp: Minute.fromDateString('2022-06-04T17:00') },
    ];
    const worker1_0604: (WorkEvent & { workerId: string })[] = [
      //
      { workerId: worker1.id, command: 'startWork', timestamp: Minute.fromDateString('2022-06-04T10:00') },
      { workerId: worker1.id, command: 'startRest', timestamp: Minute.fromDateString('2022-06-04T13:00') },
    ];

    repo.workEvents = [...worker1_0531, ...worker1_0601, ...worker2_0604, ...worker1_0604];

    const same = (w1: WorkEvent, w2: WorkEvent) => {
      expect(w1.command).toEqual(w2.command);
      expect(w1.timestamp.isSame(w2.timestamp)).toBe(true);
    };
    const _same = (activity: DailyActivity, events: WorkEvent[]) => {
      expect(activity.getEvents().length).toEqual(events.length);
      activity.getEvents().forEach((ev, ix) => {
        expect(ev.command).toEqual(events[ix].command);
        expect(ev.timestamp.isSame(events[ix].timestamp)).toBe(true);
      });
    };

    const inMonth = await repo.listDailyActivities(worker1.id, Month.fromDateString('2022-06'));
    expect(inMonth.length).toBe(30);
    inMonth.forEach((activity, ix) => {
      if (ix === 0) {
        _same(activity, worker1_0601);
      } else if (ix === 3) {
        _same(activity, worker1_0604);
      } else {
        expect(activity.getEvents().length).toBe(0);
      }
    });

    const between = await repo.listDailyActivities(
      worker1.id,
      new Between(Day.fromDateString('2022-05-31'), Day.fromDateString('2022-06-03')),
    );
    expect(between.length).toBe(4);
    between.forEach((activity, ix) => {
      if (ix === 0) {
        _same(activity, worker1_0531);
      } else if (ix === 1) {
        _same(activity, worker1_0601);
      } else {
        _same(activity, []);
      }
    });
  });
});

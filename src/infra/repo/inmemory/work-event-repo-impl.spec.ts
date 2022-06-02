import { DailyActivity } from '@domain/model/daily-activity';
import { InMemoryWorkEventRepo } from './work-event-repo-impl';
import { Worker } from '@domain/model/worker';
import { WorkEvent } from '@domain/model/work-event';
import { Day, Minute } from '@domain/model/date';

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
});

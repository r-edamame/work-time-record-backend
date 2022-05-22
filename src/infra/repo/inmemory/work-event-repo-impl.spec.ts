import { DailyActivity } from '@domain/model/work-event';
import { InMemoryWorkEventRepo } from './work-event-repo-impl';
import dayjs from 'dayjs';
import { Worker } from '@domain/model/worker';

describe('InMemoryWorkEventRepo', () => {
  let repo: InMemoryWorkEventRepo;

  beforeEach(() => {
    repo = new InMemoryWorkEventRepo();
  });

  it('can save and retrieve dailyActivity', async () => {
    const worker = Worker.createWorker('test-save');
    const activity: DailyActivity = {
      daily: [
        { command: 'startRest', timestamp: dayjs('2022-05-22T10:30:00') },
        { command: 'startRest', timestamp: dayjs('2022-05-22T13:00:00') },
        { command: 'resumeWork', timestamp: dayjs('2022-05-22T14:30:00') },
        { command: 'finishWork', timestamp: dayjs('2022-05-22T18:30:00') },
      ],
    };

    const result = await repo.saveDailyActivity(worker.id, activity);
    expect(result).toBe(true);

    const retrieved = await repo.getDailyActivity(worker.id, dayjs('2022-05-22T00:00:00'));
    expect(retrieved.daily.length).toEqual(4);
    activity.daily.forEach((ev, ix) => {
      expect(retrieved.daily[ix].command).toEqual(ev.command);
      expect(retrieved.daily[ix].timestamp.isSame(ev.timestamp)).toBe(true);
    });
  });

  it('can update dailyActivity', async () => {
    const worker = Worker.createWorker('test-update');
    const activity: DailyActivity = {
      daily: [
        { command: 'startWork', timestamp: dayjs('2022-05-21T10:30:00') },
        { command: 'startRest', timestamp: dayjs('2022-05-21T13:00:00') },
        { command: 'resumeWork', timestamp: dayjs('2022-05-21T14:30:00') },
        { command: 'finishWork', timestamp: dayjs('2022-05-21T18:30:00') },
      ],
    };

    await repo.saveDailyActivity(worker.id, activity);

    const restingChanged: DailyActivity = {
      daily: [
        activity.daily[0],
        { command: 'startRest', timestamp: dayjs('2022-05-21T14:00:00') },
        { command: 'resumeWork', timestamp: dayjs('2022-05-21T15:30:00') },
        activity.daily[3],
      ],
    };

    await repo.saveDailyActivity(worker.id, restingChanged);

    const retrieved = await repo.getDailyActivity(worker.id, dayjs('2022-05-21T23:59:59'));

    expect(retrieved.daily.length).toEqual(4);
    restingChanged.daily.forEach((ev, ix) => {
      expect(retrieved.daily[ix].command).toEqual(ev.command);
      expect(retrieved.daily[ix].timestamp.isSame(ev.timestamp)).toBe(true);
    });
  });
});

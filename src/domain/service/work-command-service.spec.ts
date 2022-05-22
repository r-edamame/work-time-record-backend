import { Worker } from '@domain/model/worker';
import { InMemoryWorkEventRepo } from '@infra/repo/inmemory/work-event-repo-impl';
import { WorkCommandService } from './work-command-service';
import dayjs from 'dayjs';
import { WorkEventRepo } from '@domain/repo/work-event-repo';
import { WorkCommand } from '@domain/model/work-command';

describe('WorkCommandService', () => {
  let eventRepo: WorkEventRepo;
  let service: WorkCommandService;

  beforeEach(() => {
    eventRepo = new InMemoryWorkEventRepo();
    service = new WorkCommandService(eventRepo);
  });

  it('can record daily activity', async () => {
    const worker = Worker.createWorker('test-record');

    const events: [WorkCommand, dayjs.Dayjs, WorkCommand[]][] = [
      ['startWork', dayjs('2022-05-22T10:00:00'), ['startRest', 'finishWork']],
      ['startRest', dayjs('2022-05-22T13:00:00'), ['resumeWork']],
      ['resumeWork', dayjs('2022-05-22T14:30:00'), ['startRest', 'finishWork']],
      ['finishWork', dayjs('2022-05-22T18:30:00'), []],
    ];

    for (const [command, timestamp, availables] of events) {
      await service.recordCommand(worker, command, timestamp);
      const availableCommands = await service.getAvailableCommands(worker);
      expect(availableCommands.length).toEqual(availables.length);
      availableCommands.forEach((c) => {
        expect(availables.includes(c)).toBe(true);
      });
    }

    const activity = await eventRepo.getDailyActivity(worker.id, dayjs('2022-05-22T00:00:00'));
    expect(activity.daily.length).toEqual(4);
    events.forEach(([command, timestamp], ix) => {
      expect(activity.daily[ix].command).toEqual(command);
      expect(activity.daily[ix].timestamp.isSame(timestamp)).toBe(true);
    });
  });
});

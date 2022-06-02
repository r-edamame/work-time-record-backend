import { Worker } from '@domain/model/worker';
import { InMemoryWorkEventRepo } from '@infra/repo/inmemory/work-event-repo-impl';
import { WorkCommandService } from './work-command-service';
import { WorkEventRepo } from '@domain/repo/work-event-repo';
import { WorkCommand } from '@domain/model/work-command';
import { Day, Minute } from '@domain/model/date';

describe('WorkCommandService', () => {
  let eventRepo: WorkEventRepo;
  let service: WorkCommandService;

  beforeEach(() => {
    eventRepo = new InMemoryWorkEventRepo();
    service = new WorkCommandService(eventRepo);
  });

  it('can record daily activity', async () => {
    const worker = Worker.createWorker('test-record');

    const events: [WorkCommand, Minute, WorkCommand[]][] = [
      ['startWork', Minute.fromDateString('2022-05-22T10:00:00'), ['startRest', 'finishWork']],
      ['startRest', Minute.fromDateString('2022-05-22T13:00:00'), ['resumeWork']],
      ['resumeWork', Minute.fromDateString('2022-05-22T14:30:00'), ['startRest', 'finishWork']],
      ['finishWork', Minute.fromDateString('2022-05-22T18:30:00'), []],
    ];

    for (const [command, timestamp, availables] of events) {
      await service.recordCommand(worker, command, timestamp);

      // 利用可能なコマンドが正しいかチェック
      const availableCommands = await service.getAvailableCommands(worker, Day.fromDateString('2022-05-22T00:00'));
      expect(availableCommands.length).toEqual(availables.length);
      availableCommands.forEach((c) => {
        expect(availables.includes(c)).toBe(true);
      });
    }

    const activity = await eventRepo.getDailyActivity(worker.id, Day.fromDateString('2022-05-22T00:00:00'));
    const savedEvents = activity.getEvents();
    expect(savedEvents.length).toEqual(4);
    events.forEach(([command, timestamp], ix) => {
      expect(savedEvents[ix].command).toEqual(command);
      expect(savedEvents[ix].timestamp.isSame(timestamp)).toBe(true);
    });
  });
});

import { Worker } from '@domain/model/worker';
import { availableCommands, WorkCommand } from '@domain/model/work-command';
import { WorkEventRepo } from '@domain/repo/work-event-repo';
import { addEventToActivity, currentStatus, DailyActivity, WorkEvent } from '@domain/model/work-event';
import dayjs from 'dayjs';

export class WorkCommandService {
  constructor(private readonly workEventRepo: WorkEventRepo) {}

  async getAvailableCommands(worker: Worker): Promise<WorkCommand[]> {
    const today = dayjs();
    const activity = await this.workEventRepo.getDailyActivity(worker.id, today);
    const [status, error] = currentStatus(activity);
    if (error) {
      throw error;
    }
    return availableCommands(status);
  }

  async recordCommand(worker: Worker, command: WorkCommand, timestamp: dayjs.Dayjs): Promise<DailyActivity> {
    const activity = await this.workEventRepo.getDailyActivity(worker.id, timestamp);
    const event: WorkEvent = {
      command,
      timestamp,
    };
    const [added, error] = addEventToActivity(event, activity);
    if (error) throw error;
    await this.workEventRepo.saveDailyActivity(worker.id, added);

    return added;
  }
}

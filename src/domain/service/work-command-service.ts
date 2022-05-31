import { Worker } from '@domain/model/worker';
import { availableCommands, WorkCommand } from '@domain/model/work-command';
import { WorkEventRepo } from '@domain/repo/work-event-repo';
import { WorkEvent } from '@domain/model/work-event';
import dayjs from 'dayjs';
import { DailyActivity } from '@domain/model/daily-activity';

export class WorkCommandService {
  constructor(private readonly workEventRepo: WorkEventRepo) {}

  async getAvailableCommands(worker: Worker, date: dayjs.Dayjs): Promise<WorkCommand[]> {
    const activity = await this.workEventRepo.getDailyActivity(worker.id, date);
    return availableCommands(activity.getCurrentStatus());
  }

  async recordCommand(worker: Worker, command: WorkCommand, timestamp: dayjs.Dayjs): Promise<DailyActivity> {
    const activity = await this.workEventRepo.getDailyActivity(worker.id, timestamp);
    const event: WorkEvent = {
      command,
      timestamp,
    };
    const [status, error] = activity.addEvent(event);
    if (error) throw error;
    await this.workEventRepo.saveDailyActivity(worker.id, activity);

    return activity;
  }
}

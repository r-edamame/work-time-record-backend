import { Worker } from '@domain/model/worker';
import { availableCommands, WorkCommand } from '@domain/model/work-command';
import { WorkEventRepo } from '@domain/repo/work-event-repo';
import { WorkEvent } from '@domain/model/work-event';
import { DailyActivity } from '@domain/model/daily-activity';
import { Between, Day, Minute, Month } from '@domain/model/date';

export class WorkCommandService {
  constructor(private readonly workEventRepo: WorkEventRepo) {}

  async getAvailableCommands(worker: Worker, day: Day): Promise<WorkCommand[]> {
    const activity = await this.workEventRepo.getDailyActivity(worker.id, day);
    return availableCommands(activity.getCurrentStatus());
  }

  async recordCommand(worker: Worker, command: WorkCommand, timestamp: Minute): Promise<DailyActivity> {
    const activity = await this.workEventRepo.getDailyActivity(worker.id, timestamp.asDay());
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

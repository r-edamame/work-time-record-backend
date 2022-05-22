import { DailyActivity, WorkEvent } from '@domain/model/work-event';
import dayjs from 'dayjs';

export interface WorkEventRepo {
  /**
   * returned DailyActivity should be ordered with timestamp ascending
   */
  getDailyActivity(workerId: string, date: dayjs.Dayjs): Promise<DailyActivity>;

  saveDailyActivity(workerId: string, activity: DailyActivity): Promise<true>;
}

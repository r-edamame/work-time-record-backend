import { DailyActivity } from '@domain/model/daily-activity';
import { Day, HasDayRange } from '@domain/model/date';

export interface WorkEventRepo {
  /**
   * returned DailyActivity should be ordered with timestamp ascending
   */
  getDailyActivity(workerId: string, day: Day): Promise<DailyActivity>;

  listDailyActivities(workerId: string, period: HasDayRange): Promise<DailyActivity[]>;

  saveDailyActivity(workerId: string, activity: DailyActivity): Promise<true>;
}

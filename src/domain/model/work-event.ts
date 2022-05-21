import { WorkCommand } from './work-command';
import { WorkStatus } from './work-status';
import dayjs from 'dayjs';

export type WorkEvent = {
  workerId: number;
  workerStatus: WorkStatus;
  command: WorkCommand;
  timestamp: dayjs.Dayjs;
};

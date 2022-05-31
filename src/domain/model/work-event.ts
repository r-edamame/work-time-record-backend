import { WorkCommand } from './work-command';
import dayjs from 'dayjs';

export type WorkEvent = {
  command: WorkCommand;
  timestamp: dayjs.Dayjs;
};

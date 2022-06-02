import { WorkCommand } from './work-command';
import { Minute } from './date';

export type WorkEvent = {
  command: WorkCommand;
  timestamp: Minute;
};

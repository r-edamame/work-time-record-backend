import { WorkCommand } from './work-command';
import { Minute } from './date';

export type WorkEvent = {
  command: WorkCommand;
  timestamp: Minute;
};

export const isSameEvent = (e1: WorkEvent, e2: WorkEvent) => {
  return e1.command === e2.command && e1.timestamp.isSame(e2.timestamp);
};

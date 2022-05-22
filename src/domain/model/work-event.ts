import { availableCommands, nextStatus, WorkCommand } from './work-command';
import { WorkStatus } from './work-status';
import dayjs from 'dayjs';
import { Either } from '@util/types';

export type WorkEvent = {
  command: WorkCommand;
  timestamp: dayjs.Dayjs;
};

export type DailyActivity = {
  daily: WorkEvent[];
};

export const currentStatus = (activity: DailyActivity): Either<WorkStatus> => {
  if (activity.daily.length === 0) return ['beforeWork', undefined];

  const [{ command: firstCommand, timestamp: startedAt }, ...remains] = activity.daily;

  if (firstCommand !== 'startWork') {
    return [undefined, new Error('first command must be "startWork"')];
  }

  const [result, error] = remains.reduce<Either<{ status: WorkStatus; timestamp: dayjs.Dayjs }>>(
    ([prev, err], event) => {
      if (err) return [undefined, err];
      if (event.timestamp.isBefore(prev.timestamp) || !event.timestamp.isSame(prev.timestamp, 'day')) {
        return [undefined, new Error('invalid timestamp')];
      }
      if (!availableCommands(prev.status).includes(event.command)) {
        return [undefined, new Error('invalid command')];
      }
      return [{ status: nextStatus(event.command), timestamp: event.timestamp }, undefined];
    },
    [{ status: 'working', timestamp: startedAt }, undefined],
  );

  if (error) return [undefined, error];
  else return [result.status, undefined];
};

export const isValidDailyActivity = (activity: DailyActivity): Either<true> => {
  const [status, error] = currentStatus(activity);

  if (error) return [undefined, error];
  else return [true, undefined];
};

export const addEventToActivity = (event: WorkEvent, activity: DailyActivity): Either<DailyActivity> => {
  const _activity: DailyActivity = {
    daily: [...activity.daily, event],
  };

  const [result, error] = isValidDailyActivity(_activity);

  if (error) return [undefined, error];
  else return [_activity, undefined];
};

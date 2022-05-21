import { WorkStatus } from './work-status';

export type WorkCommand = 'startWork' | 'startRest' | 'resumeWork' | 'finishWork';

export const commandName = (command: WorkCommand): string => {
  switch (command) {
    case 'startWork':
      return '出勤';
    case 'startRest':
      return '休憩';
    case 'resumeWork':
      return '再開';
    case 'finishWork':
      return '退勤';
  }
};

export const availableCommands = (status: WorkStatus): WorkCommand[] => {
  switch (status) {
    case 'beforeWork':
      return ['startWork'];
    case 'working':
      return ['startRest', 'finishWork'];
    case 'resting':
      return ['resumeWork'];
    case 'afterWork':
      return [];
  }
};

export const nextStatus = (command: WorkCommand): WorkStatus => {
  switch (command) {
    case 'startWork':
      return 'working';
    case 'startRest':
      return 'resting';
    case 'resumeWork':
      return 'working';
    case 'finishWork':
      return 'afterWork';
  }
};

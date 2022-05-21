export type WorkStatus = 'beforeWork' | 'working' | 'resting' | 'afterWork';

export const statusName = (status: WorkStatus): string => {
  switch (status) {
    case 'beforeWork':
      return '未出勤';
    case 'working':
      return '仕事中';
    case 'resting':
      return '休憩中';
    case 'afterWork':
      return '業務終了';
  }
};

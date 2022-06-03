import { Either } from '@util/types';
import { DailyActivity } from './daily-activity';
import { Day, Minute } from './date';
import { WorkCommand } from './work-command';
import { WorkEvent } from './work-event';
import { WorkStatus } from './work-status';
import { Worker } from './worker';

describe('DailyActivity', () => {
  const noerror = <T>([_, error]: Either<T>) => {
    expect(error).toBe(undefined);
  };

  it('can add events', () => {
    const worker = Worker.createWorker('worker');
    const activity = DailyActivity.new(worker.id, Day.fromDateString('2022-05-31'));

    const testdata: [WorkEvent, WorkStatus][] = [
      [{ command: 'startWork', timestamp: Minute.fromDateString('2022-05-31T10:30') }, 'working'],
      [{ command: 'startRest', timestamp: Minute.fromDateString('2022-05-31T13:00') }, 'resting'],
      [{ command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-31T14:30') }, 'working'],
      [{ command: 'startRest', timestamp: Minute.fromDateString('2022-05-31T18:30') }, 'resting'],
      [{ command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-31T19:00') }, 'working'],
      [{ command: 'finishWork', timestamp: Minute.fromDateString('2022-05-31T20:30') }, 'afterWork'],
    ];

    // 上のイベントを追加でき、ステータスも正しく変更される
    for (const [event, afterStatus] of testdata) {
      const [status, error] = activity.addEvent(event);
      expect(status).toEqual(afterStatus);
    }
  });

  it('occur error when add invalid command', () => {
    const worker = Worker.createWorker('test');
    const activity = DailyActivity.new(worker.id, Day.fromDateString('2022-05-31'));
    let timestamp: Minute;

    const test = (coms: WorkCommand[]) => {
      coms.forEach((command) => {
        const [status, error] = activity.addEvent({ command, timestamp });
        expect(error?.message).toBe('invalid command');
      });
    };

    // 出勤前
    timestamp = Minute.fromDateString('2022-05-31T10:00');
    test(['startRest', 'resumeWork', 'finishWork']);
    noerror(activity.addEvent({ command: 'startWork', timestamp }));

    // 仕事中
    timestamp = Minute.fromDateString('2022-05-31T13:00');
    test(['startWork', 'resumeWork']);
    noerror(activity.addEvent({ command: 'startRest', timestamp }));

    // 休憩中
    timestamp = Minute.fromDateString('2022-05-31T14:30');
    test(['startWork', 'startRest', 'finishWork']);
    noerror(activity.addEvent({ command: 'resumeWork', timestamp }));

    // 再開後
    timestamp = Minute.fromDateString('2022-05-31T18:00');
    test(['startWork', 'resumeWork']);
    noerror(activity.addEvent({ command: 'finishWork', timestamp }));

    // 仕事終了後はどのコマンドも受け付けない
    timestamp = Minute.fromDateString('2022-05-31T20:00');
    test(['startWork', 'startRest', 'resumeWork', 'finishWork']);
  });

  it('occur error when add invalid timestamp', () => {
    const worker = Worker.createWorker('test');
    const activity = DailyActivity.new(worker.id, Day.fromDateString('2022-10-31'));
    let timestamp: Minute;

    // 開始時間がその日ではない場合
    timestamp = Minute.fromDateString('2022-10-30T10:00');
    expect(activity.addEvent({ command: 'startWork', timestamp })[1]?.message).toBe('invalid timestamp');

    timestamp = Minute.fromDateString('2022-10-31T10:00');
    noerror(activity.addEvent({ command: 'startWork', timestamp }));

    // 出勤時より早い時間のEventを追加
    timestamp = Minute.fromDateString('2022-10-31T09:00');
    expect(activity.addEvent({ command: 'startRest', timestamp })[1]?.message).toBe('invalid timestamp');
  });

  it('can make from workEvent array', () => {
    const worker = Worker.createWorker('test');
    const events: WorkEvent[] = [
      { command: 'startWork', timestamp: Minute.fromDateString('2022-05-31T10:30') },
      { command: 'startRest', timestamp: Minute.fromDateString('2022-05-31T13:00') },
      { command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-31T14:30') },
      { command: 'startRest', timestamp: Minute.fromDateString('2022-05-31T18:30') },
      { command: 'resumeWork', timestamp: Minute.fromDateString('2022-05-31T19:00') },
      { command: 'finishWork', timestamp: Minute.fromDateString('2022-05-31T20:30') },
    ];

    const [activity, error] = DailyActivity.fromEvents(worker.id, Day.fromDateString('2022-05-31'), events);
    expect(error).toBe(undefined);
    expect(activity).not.toBe(undefined);
  });
});

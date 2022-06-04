import { DailyActivity } from '@domain/model/daily-activity';
import { Day, HasDayRange, Minute } from '@domain/model/date';
import { WorkCommand } from '@domain/model/work-command';
import { isSameEvent, WorkEvent } from '@domain/model/work-event';
import { WorkEventRepo } from '@domain/repo/work-event-repo';
import * as firestore from 'firebase-admin/firestore';

const isWorkCommand = (str: string): str is WorkCommand => {
  return ['startWork', 'startRest', 'resumeWork', 'finishWork'].includes(str);
};

const fromDocumentData = (data: firestore.DocumentData): WorkEvent => {
  const _command = data.command;
  const _timestamp = data.timestamp;

  if (typeof _timestamp !== 'string' || typeof _command !== 'string') {
    throw new Error('invalid data structure');
  }

  const timestamp = Minute.fromDateString(_timestamp);

  if (!isWorkCommand(_command)) {
    throw new Error('invalid command value');
  }

  return {
    timestamp,
    command: _command,
  };
};

export class FirestoreWorkEventRepoImpl implements WorkEventRepo {
  private workEvents: (workerId: string, day: Day) => firestore.CollectionReference;

  constructor(db: firestore.Firestore) {
    this.workEvents = (workerId, day) => db.collection('work-events').doc(workerId).collection(day.format());
  }

  async getDailyActivity(workerId: string, day: Day): Promise<DailyActivity> {
    const response = await this.workEvents(workerId, day).get();
    const events = response.docs.map((snapshot) => {
      return fromDocumentData(snapshot.data());
    });

    const [activity, error] = DailyActivity.fromEvents(workerId, day, events);

    if (error) {
      throw error;
    }
    return activity;
  }

  async listDailyActivities(workerId: string, period: HasDayRange): Promise<DailyActivity[]> {
    const days = period.enumerateDays();
    const activities = await Promise.all(days.map((day) => this.getDailyActivity(workerId, day)));
    return activities;
  }

  async saveDailyActivity(workerId: string, activity: DailyActivity): Promise<true> {
    const toSave = activity.getEvents();
    const response = await this.workEvents(workerId, activity.day).get();
    const saved: [WorkEvent, string][] = response.docs.map((snapshot) => {
      return [fromDocumentData(snapshot.data()), snapshot.id];
    });

    const unsavedEvents = toSave.filter((toSaveEvent) => {
      return saved.find(([savedEvent, id]) => isSameEvent(savedEvent, toSaveEvent)) === undefined;
    });

    const toDeleteEvents = saved.filter(([savedEvent, id]) => {
      return toSave.find((toSaveEvent) => isSameEvent(savedEvent, toSaveEvent)) === undefined;
    });

    await Promise.all(
      unsavedEvents.map((event) => {
        return this.workEvents(workerId, activity.day).add({
          command: event.command,
          timestamp: event.timestamp.format(),
        });
      }),
    );

    await Promise.all(
      toDeleteEvents.map(([_event, id]) => {
        return this.workEvents(workerId, activity.day).doc(id).delete();
      }),
    );
    return true;
  }
}

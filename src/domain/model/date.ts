import dayjs from 'dayjs';

export interface HasDayRange {
  enumerateDays(): Day[];
}

export class Minute {
  private _minute: dayjs.Dayjs;
  constructor(minute: dayjs.Dayjs) {
    this._minute = minute.clone();
  }

  private unit: 'minute' = 'minute';

  isSame(minute: Minute): boolean {
    return this._minute.isSame(minute._minute, this.unit);
  }

  isAfter(minute: Minute): boolean {
    return this._minute.isAfter(minute._minute, this.unit);
  }
  isBefore(minute: Minute): boolean {
    return this._minute.isBefore(minute._minute, this.unit);
  }

  asDay(): Day {
    return new Day(this._minute);
  }
  asMonth(): Month {
    return new Month(this._minute);
  }

  diff(minute: Minute): number {
    return this._minute.diff(minute._minute, this.unit);
  }

  static fromDateString(date: string): Minute {
    return new Minute(dayjs(date));
  }

  format(): string {
    return this._minute.format('YYYY-MM-DDTHH:mm');
  }

  now(): Minute {
    return new Minute(dayjs());
  }
}

export class Day {
  private _day: dayjs.Dayjs;
  constructor(day: dayjs.Dayjs) {
    this._day = day.clone();
  }

  getStartMinute(): Minute {
    return new Minute(this._day.clone().startOf('day'));
  }
  getEndMinute(): Minute {
    return new Minute(this._day.clone().endOf('day'));
  }

  isSame(day: Day): boolean {
    return this._day.isSame(day._day, 'day');
  }

  isAfter(day: Day): boolean {
    return this._day.isAfter(day._day, 'day');
  }
  isBefore(day: Day): boolean {
    return this._day.isBefore(day._day, 'day');
  }

  in(time: Minute): boolean {
    return !(time.isBefore(this.getStartMinute()) || time.isAfter(this.getEndMinute()));
  }

  next(): Day {
    return new Day(this._day.clone().add(1, 'day'));
  }

  asMonth(): Month {
    return new Month(this._day);
  }

  static fromDateString(date: string): Day {
    return new Day(dayjs(date));
  }

  format(): string {
    return this._day.format('YYYY-MM-DD');
  }

  now(): Day {
    return new Day(dayjs());
  }
}

export class Month implements HasDayRange {
  private _month: dayjs.Dayjs;
  constructor(month: dayjs.Dayjs) {
    this._month = month.clone();
  }

  getStart(): Day {
    return new Day(this._month.clone().startOf('month'));
  }
  getEnd(): Day {
    return new Day(this._month.clone().endOf('month'));
  }

  isSame(month: Month) {
    return this._month.isSame(month._month, 'month');
  }

  isAfter(month: Month): boolean {
    return this._month.isAfter(month._month, 'month');
  }
  isBefore(month: Month): boolean {
    return this._month.isBefore(month._month, 'month');
  }

  in(time: Day | Minute): boolean {
    if (time instanceof Day) {
      return !(time.isBefore(this.getStart()) || time.isAfter(this.getEnd()));
    } else {
      return this.in(time.asDay());
    }
  }

  enumerateDays(): Day[] {
    return enumerate(this.getStart(), this.getEnd());
  }

  static fromDateString(date: string): Month {
    return new Month(dayjs(date));
  }

  format(): string {
    return this._month.format('YYYY-MM');
  }

  now(): Month {
    return new Month(dayjs());
  }
}

export class Between implements HasDayRange {
  private _from: Day;
  private _to: Day;
  constructor(from: Day, to: Day) {
    this._from = from;
    this._to = to;
  }

  enumerateDays(): Day[] {
    return enumerate(this._from, this._to);
  }

  withoutOrder(day1: Day, day2: Day): Between {
    if (day1.isAfter(day2)) {
      return new Between(day2, day1);
    } else {
      return new Between(day1, day2);
    }
  }
}

const enumerate = (from: Day, to: Day): Day[] => {
  let current = from;
  const days = [];

  while (!current.isAfter(to)) {
    days.push(current);
    current = current.next();
  }

  return days;
};

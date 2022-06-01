import dayjs from 'dayjs';

export class Day {
  private _day: dayjs.Dayjs;
  constructor(day: dayjs.Dayjs) {
    this._day = day.clone();
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

  next(): Day {
    return new Day(this._day.clone().add(1, 'day'));
  }
}

export class Month {
  private _month: dayjs.Dayjs;
  constructor(month: dayjs.Dayjs) {
    this._month = month;
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

  in(day: Day): boolean {
    return !(day.isBefore(this.getStart()) || day.isAfter(this.getEnd()));
  }

  enumerateDays(): Day[] {
    return enumerate(this.getStart(), this.getEnd());
  }
}

export class Between {
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

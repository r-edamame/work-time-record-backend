import dayjs from 'dayjs';
import { Between, Day, Month } from './date';

const pad = (n: number) => String(n).padStart(2, '0');

describe('Day', () => {
  it('should judge two days is same with isSame', () => {
    let d1: dayjs.Dayjs;
    let d2: dayjs.Dayjs;

    d1 = dayjs('2022-06-01T18:00');
    d2 = dayjs('2022-06-01T18:00');
    expect(new Day(d1).isSame(new Day(d2))).toBe(true);
    expect(new Day(d2).isSame(new Day(d1))).toBe(true);

    d1 = dayjs('2022-06-01').startOf('day');
    d2 = dayjs('2022-06-01').endOf('day');
    expect(new Day(d1).isSame(new Day(d2))).toBe(true);
    expect(new Day(d2).isSame(new Day(d1))).toBe(true);

    d1 = dayjs('2022-06-01').endOf('day');
    d2 = dayjs('2022-06-02').startOf('day');
    expect(new Day(d1).isSame(new Day(d2))).toBe(false);
    expect(new Day(d2).isSame(new Day(d1))).toBe(false);
  });

  it('should judge two days order with isAfter', () => {
    let d1: dayjs.Dayjs;
    let d2: dayjs.Dayjs;

    d1 = dayjs('2022-06-01');
    d2 = dayjs('2022-06-01');
    expect(new Day(d1).isAfter(new Day(d2))).toBe(false);
    expect(new Day(d2).isAfter(new Day(d1))).toBe(false);

    d1 = dayjs('2022-06-01');
    d2 = dayjs('2022-06-02');
    expect(new Day(d1).isAfter(new Day(d2))).toBe(false);
    expect(new Day(d2).isAfter(new Day(d1))).toBe(true);

    d1 = dayjs('2022-06-01').endOf('day');
    d2 = dayjs('2022-06-02').startOf('day');
    expect(new Day(d1).isAfter(new Day(d2))).toBe(false);
    expect(new Day(d2).isAfter(new Day(d1))).toBe(true);
  });

  it('should judge two days order with isBefore', () => {
    let d1: dayjs.Dayjs;
    let d2: dayjs.Dayjs;

    d1 = dayjs('2022-06-01');
    d2 = dayjs('2022-06-01');
    expect(new Day(d1).isBefore(new Day(d2))).toBe(false);
    expect(new Day(d2).isBefore(new Day(d1))).toBe(false);

    d1 = dayjs('2022-06-01');
    d2 = dayjs('2022-06-02');
    expect(new Day(d1).isBefore(new Day(d2))).toBe(true);
    expect(new Day(d2).isBefore(new Day(d1))).toBe(false);

    d1 = dayjs('2022-06-01').endOf('day');
    d2 = dayjs('2022-06-02').startOf('day');
    expect(new Day(d1).isBefore(new Day(d2))).toBe(true);
    expect(new Day(d2).isBefore(new Day(d1))).toBe(false);
  });

  it('should return next day', () => {
    let d1: dayjs.Dayjs;
    let d2: dayjs.Dayjs;

    d1 = dayjs('2022-06-01');
    d2 = dayjs('2022-06-02');
    expect(new Day(d1).next().isSame(new Day(d2))).toBe(true);
  });
});

describe('Month', () => {
  it('should judge two month is same with isSame', () => {
    let m1: dayjs.Dayjs;
    let m2: dayjs.Dayjs;

    m1 = dayjs('2022-06');
    m2 = dayjs('2022-06');
    expect(new Month(m1).isSame(new Month(m2))).toBe(true);
    expect(new Month(m2).isSame(new Month(m1))).toBe(true);

    m1 = dayjs('2022-06').startOf('month');
    m2 = dayjs('2022-06').endOf('month');
    expect(new Month(m1).isSame(new Month(m2))).toBe(true);
    expect(new Month(m2).isSame(new Month(m1))).toBe(true);

    m1 = dayjs('2022-06').endOf('month');
    m2 = dayjs('2022-07').startOf('month');
    expect(new Month(m1).isSame(new Month(m2))).toBe(false);
    expect(new Month(m2).isSame(new Month(m1))).toBe(false);
  });

  it('should judge two month order with isAfter', () => {
    let m1: dayjs.Dayjs;
    let m2: dayjs.Dayjs;

    m1 = dayjs('2022-06');
    m2 = dayjs('2022-06');
    expect(new Month(m1).isAfter(new Month(m2))).toBe(false);
    expect(new Month(m2).isAfter(new Month(m1))).toBe(false);

    m1 = dayjs('2022-06').startOf('month');
    m2 = dayjs('2022-06').endOf('month');
    expect(new Month(m1).isAfter(new Month(m2))).toBe(false);
    expect(new Month(m2).isAfter(new Month(m1))).toBe(false);

    m1 = dayjs('2022-06').endOf('month');
    m2 = dayjs('2022-07').startOf('month');
    expect(new Month(m1).isAfter(new Month(m2))).toBe(false);
    expect(new Month(m2).isAfter(new Month(m1))).toBe(true);
  });

  it('should judge two month order with isBefore', () => {
    let m1: dayjs.Dayjs;
    let m2: dayjs.Dayjs;

    m1 = dayjs('2022-06');
    m2 = dayjs('2022-06');
    expect(new Month(m1).isBefore(new Month(m2))).toBe(false);
    expect(new Month(m2).isBefore(new Month(m1))).toBe(false);

    m1 = dayjs('2022-06').startOf('month');
    m2 = dayjs('2022-06').endOf('month');
    expect(new Month(m1).isBefore(new Month(m2))).toBe(false);
    expect(new Month(m2).isBefore(new Month(m1))).toBe(false);

    m1 = dayjs('2022-06').endOf('month');
    m2 = dayjs('2022-07').startOf('month');
    expect(new Month(m1).isBefore(new Month(m2))).toBe(true);
    expect(new Month(m2).isBefore(new Month(m1))).toBe(false);
  });

  it('can enumerate days in month', () => {
    const month = new Month(dayjs('2022-06'));

    const days = month.enumerateDays();
    expect(days.length).toBe(30);
    days.forEach((day, ix) => {
      const d = dayjs(`2022-06-${pad(ix + 1)}`);
      expect(day.isSame(new Day(d)));
    });
  });
});

describe('Between', () => {
  it('can enumerate date', () => {
    const between1 = new Between(new Day(dayjs('2022-06-04')), new Day(dayjs('2022-06-10')));
    const days1 = between1.enumerateDays();
    expect(days1.length).toBe(7);
    days1.forEach((day, ix) => {
      const d = dayjs(`2022-06-${ix + 4}`);
      expect(day.isSame(new Day(d))).toBe(true);
    });

    const between2 = new Between(new Day(dayjs('2022-06-28')), new Day(dayjs('2022-07-03')));
    const days2 = between2.enumerateDays();
    expect(days2.length).toBe(6);
    days2.forEach((day, ix) => {
      const isNextMonth = ix >= 3;
      const d = dayjs(`2022-${!isNextMonth ? 6 : 7}-${!isNextMonth ? ix + 28 : ix - 2}`);
      expect(day.isSame(new Day(d))).toBe(true);
    });

    const between3 = new Between(new Day(dayjs('2022-06-28')), new Day(dayjs('2022-06-27')));
    const days3 = between3.enumerateDays();
    expect(days3.length).toBe(0);
  });
});

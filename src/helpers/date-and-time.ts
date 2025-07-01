import moment from 'moment-timezone';
import { config } from '../core/config';

export const getDateTime = moment.tz(config.timeZone).toDate();

export const formatDate = (date: Date | string): string => {
  return moment(date).format('YYYY-MM-DD');
};

export type TimeRange = { start: number; end: number };

export type WorkingSession = {
  start: string;
  end: string;
};

export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getDayKeyFromDate(date: Date): Day {
  const map: Record<number, Day> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  return map[date.getDay()];
}

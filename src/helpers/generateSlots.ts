import moment from 'moment-timezone';
import { IAppointmentModel } from '../apps/appointment/models/appointment.model';
import {
  Day,
  formatDate,
  getDateTime,
  getDayKeyFromDate,
  minutesToTime,
  TimeRange,
  timeStringToMinutes,
  WorkingSession,
} from './date-and-time';
import { IAppointmentConfig } from '../apps/appointment-config/types';
import { config } from '../core/config';

interface WorkingHours {
  [day: string]: WorkingSession[];
}

interface PreparedData {
  workingHours: WorkingHours;
  workingHoursInMinutes: Map<Day, TimeRange[]>;
  unavailableByDayInMinutes: Map<Day, TimeRange[]>[];
  bookedByDate: Map<string, TimeRange[]>;
  availableDays: Day[];
  todayInfo: {
    dateStr: string;
    nowMinutes: number;
    minMinutesAhead: number;
  };
  nowMoment: moment.Moment;
  bufferTime: number;
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

function prepareData(
  unavailableTimes: Record<string, WorkingSession[]>[],
  existingAppointments: IAppointmentModel[],
  appointmentConfig: IAppointmentConfig,
  now: Date,
): PreparedData {
  const nowMoment = moment(now).tz(config.timeZone);
  const nowMinutes = nowMoment.hours() * 60 + nowMoment.minutes();
  const todayDateStr = formatDate(now);

  const workingHours: WorkingHours = Object.fromEntries(
    appointmentConfig.available_day_time instanceof Map
      ? appointmentConfig.available_day_time.entries()
      : Object.entries(appointmentConfig.available_day_time || {}),
  );

  const workingHoursInMinutes = new Map<Day, TimeRange[]>();
  for (const [day, sessions] of Object.entries(workingHours)) {
    if (sessions && sessions.length > 0) {
      workingHoursInMinutes.set(
        day as Day,
        sessions.map((s) => ({
          start: timeStringToMinutes(s.start),
          end: timeStringToMinutes(s.end),
        })),
      );
    }
  }

  const unavailableByDayInMinutes: Map<Day, TimeRange[]>[] =
    unavailableTimes.map((counselorUnavailable) => {
      const map = new Map<Day, TimeRange[]>();

      if (
        !counselorUnavailable ||
        typeof counselorUnavailable !== 'object' ||
        Object.keys(counselorUnavailable).length === 0
      ) {
        return map;
      }

      for (const [day, sessions] of Object.entries(counselorUnavailable)) {
        if (sessions && Array.isArray(sessions) && sessions.length > 0) {
          map.set(
            day as Day,
            sessions.map((s) => ({
              start: timeStringToMinutes(s.start),
              end: timeStringToMinutes(s.end),
            })),
          );
        }
      }
      return map;
    });

  const bookedByDate = new Map<string, TimeRange[]>();
  for (const appt of existingAppointments) {
    if (appt.status === 'cancelled' || appt.cancellation?.cancelledAt) continue;

    const startMoment = moment(appt.scheduledAt).tz(config.timeZone);
    const endMoment = moment(appt.scheduledEndAt).tz(config.timeZone);
    const dateStr = startMoment.format('YYYY-MM-DD');

    if (!bookedByDate.has(dateStr)) {
      bookedByDate.set(dateStr, []);
    }

    bookedByDate.get(dateStr)!.push({
      start: startMoment.hours() * 60 + startMoment.minutes(),
      end: endMoment.hours() * 60 + endMoment.minutes(),
    });
  }

  const availableDays = Array.from(workingHoursInMinutes.keys());

  return {
    workingHours,
    workingHoursInMinutes,
    unavailableByDayInMinutes,
    bookedByDate,
    availableDays,
    todayInfo: {
      dateStr: todayDateStr,
      nowMinutes,
      minMinutesAhead: nowMinutes + appointmentConfig.booking_lead_time,
    },
    nowMoment,
    bufferTime: appointmentConfig.buffer_time,
  };
}

function isAnyCounselorAvailable(
  slot: TimeRange,
  dayKey: Day,
  unavailableByDayInMinutes: Map<Day, TimeRange[]>[],
): boolean {
  if (unavailableByDayInMinutes.length === 0) return true;

  for (const counselorUnavailableMap of unavailableByDayInMinutes) {
    const unavRanges = counselorUnavailableMap.get(dayKey) || [];
    const hasConflict = unavRanges.some((unav) => overlaps(slot, unav));

    if (!hasConflict) {
      return true;
    }
  }

  return false;
}

function generateDaySlots(
  dayKey: Day,
  dateStr: string,
  isToday: boolean,
  prepared: PreparedData,
  appointmentDuration: number,
): string[] {
  const sessions = prepared.workingHoursInMinutes.get(dayKey);
  if (!sessions || sessions.length === 0) return [];

  const bookedTimes = prepared.bookedByDate.get(dateStr) || [];
  const slotsForDay: string[] = [];

  for (const session of sessions) {
    let startMin = session.start;
    const endMin = session.end;

    while (startMin + appointmentDuration <= endMin) {
      const slot: TimeRange = {
        start: startMin,
        end: startMin + appointmentDuration,
      };

      if (isToday && slot.end <= prepared.todayInfo.nowMinutes) {
        startMin = slot.end + prepared.bufferTime;
        continue;
      }

      if (isToday && slot.start < prepared.todayInfo.minMinutesAhead) {
        startMin = slot.end + prepared.bufferTime;
        continue;
      }

      const isBooked = bookedTimes.some((appt) => overlaps(slot, appt));
      if (isBooked) {
        startMin = slot.end + prepared.bufferTime;
        continue;
      }

      const available = isAnyCounselorAvailable(
        slot,
        dayKey,
        prepared.unavailableByDayInMinutes,
      );

      if (available) {
        const slotString = `${minutesToTime(slot.start)} - ${minutesToTime(
          slot.end,
        )}`;
        slotsForDay.push(slotString);
      }

      startMin = slot.end + prepared.bufferTime;
    }
  }

  return slotsForDay;
}

export function generateAppointmentSlots({
  unavailableTimes,
  appointmentDuration,
  existingAppointments,
  appointmentConfig,
}: {
  unavailableTimes: Record<string, WorkingSession[]>[];
  appointmentDuration: number;
  existingAppointments: IAppointmentModel[];
  appointmentConfig: IAppointmentConfig;
}): any {
  const now = getDateTime();
  const prepared = prepareData(
    unavailableTimes,
    existingAppointments,
    appointmentConfig,
    now,
  );

  const slots: Record<string, string[]> = {};
  let workingDayCount = 0;
  let offset = 0;

  while (workingDayCount < appointmentConfig.slot_days_range) {
    const currentDay = prepared.nowMoment.clone().add(offset++, 'days');
    const dayKey = getDayKeyFromDate(currentDay.toDate());

    if (!dayKey || !prepared.availableDays.includes(dayKey)) continue;

    const dateStr = currentDay.format('YYYY-MM-DD');
    const isToday = dateStr === prepared.todayInfo.dateStr;

    const slotsForDay = generateDaySlots(
      dayKey,
      dateStr,
      isToday,
      prepared,
      appointmentDuration,
    );

    if (slotsForDay.length > 0) {
      slots[dateStr] = slotsForDay;
      workingDayCount++;
    }
  }

  return slots;
}

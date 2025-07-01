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

interface WorkingHours {
  [day: string]: WorkingSession[];
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function generateAppointmentSlots({
  unavailableTimes,
  appointmentDuration,
  existingAppointments,
  appointmentConfig,
}: {
  unavailableTimes: Record<string, WorkingSession[]>;
  appointmentDuration: number;
  existingAppointments: IAppointmentModel[];
  appointmentConfig: IAppointmentConfig;
}): any {
  const slots: Record<string, string[]> = {};
  const now = getDateTime;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const bufferTime = appointmentConfig.buffer_time;
  const workingHours: WorkingHours = Object.fromEntries(
    appointmentConfig.available_day_time instanceof Map
      ? appointmentConfig.available_day_time.entries()
      : Object.entries(appointmentConfig.available_day_time || {}),
  );

  // get the valid appointments
  const validAppointments: Record<string, TimeRange[]> = {};
  for (const appt of existingAppointments) {
    if (appt.status === 'cancelled' || appt.cancellation?.cancelledAt) continue;

    const startDate = new Date(appt.scheduledAt);
    const endDate = new Date(appt.scheduledEndAt);
    const dateStr = formatDate(startDate);

    if (!validAppointments[dateStr]) validAppointments[dateStr] = [];

    validAppointments[dateStr].push({
      start: startDate.getHours() * 60 + startDate.getMinutes(),
      end: endDate.getHours() * 60 + endDate.getMinutes(),
    });
  }

  const availableDays = Object.keys(workingHours).filter(
    (day) => workingHours[day]?.length > 0,
  ) as Day[];

  let workingDayCount = 0;
  let offset = 0;

  // get the slots from the working days with the range of slot days
  while (workingDayCount < appointmentConfig.slot_days_range) {
    const currentDay = moment(now).add(offset++, 'days').toDate();
    const dayKey = getDayKeyFromDate(currentDay);

    if (!dayKey || !availableDays.includes(dayKey)) continue;

    const dateStr = formatDate(currentDay);
    const isToday = dateStr === formatDate(now);
    const sessions = workingHours[dayKey];

    if (!sessions || sessions.length === 0) continue;

    const unavTimes = unavailableTimes[dayKey] || [];
    const bookedTimes = validAppointments[dateStr] || [];
    const slotsForDay: string[] = [];
    const minMinutesAhead = nowMinutes + appointmentConfig.booking_lead_time; // ahead of time when student is boook

    for (const session of sessions) {
      let startMin = timeStringToMinutes(session.start); // convert time to minutes start from midnight (e.g) 9:00 = 540minutes
      const endMin = timeStringToMinutes(session.end);

      while (startMin + appointmentDuration <= endMin) {
        const slot: TimeRange = {
          start: startMin,
          end: startMin + appointmentDuration,
        };

        // slot end before or at the current time
        if (isToday && slot.end <= nowMinutes) {
          //proccedd to the next slot
          startMin = slot.end + bufferTime;
          continue;
        }

        //slot starts too soon not enough time in advance, then skip it and go to the next one
        if (isToday && slot.start < minMinutesAhead) {
          startMin = slot.end + bufferTime;
          continue;
        }
        //check if this slot overlaps with any unavailable time or already booked appointments
        const hasConflict =
          unavTimes.some((unav) =>
            overlaps(slot, {
              start: timeStringToMinutes(unav.start),
              end: timeStringToMinutes(unav.end),
            }),
          ) || bookedTimes.some((appt) => overlaps(slot, appt));

        // push the time of that day if the slot is not conflict
        if (!hasConflict) {
          slotsForDay.push(
            `${minutesToTime(slot.start)} - ${minutesToTime(slot.end)}`,
          );
        }

        // procceed to the next time slot
        startMin = slot.end + bufferTime;
      }
    }
    // if theres slot on this day, then save it to slot
    if (slotsForDay.length) {
      slots[dateStr] = slotsForDay;
      workingDayCount++;
    }
  }

  return slots;
}

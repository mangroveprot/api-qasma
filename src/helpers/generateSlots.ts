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

  // Use your existing getDateTime() function
  const now = getDateTime();
  // But calculate minutes using moment to preserve timezone info
  const nowMoment = moment(now).tz(config.timeZone);
  const nowMinutes = nowMoment.hours() * 60 + nowMoment.minutes();
  const todayDateStr = formatDate(now);
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

    // convert appointment times to the same timezone
    const startMoment = moment(appt.scheduledAt).tz(config.timeZone);
    const endMoment = moment(appt.scheduledEndAt).tz(config.timeZone);
    const dateStr = startMoment.format('YYYY-MM-DD');

    if (!validAppointments[dateStr]) validAppointments[dateStr] = [];

    validAppointments[dateStr].push({
      start: startMoment.hours() * 60 + startMoment.minutes(),
      end: endMoment.hours() * 60 + endMoment.minutes(),
    });
  }

  const availableDays = Object.keys(workingHours).filter(
    (day) => workingHours[day]?.length > 0,
  ) as Day[];

  let workingDayCount = 0;
  let offset = 0;

  // get the slots from the working days with the range of slot days
  while (workingDayCount < appointmentConfig.slot_days_range) {
    const currentDay = nowMoment.clone().add(offset++, 'days');
    const dayKey = getDayKeyFromDate(currentDay.toDate());
    if (!dayKey || !availableDays.includes(dayKey)) continue;

    const dateStr = currentDay.format('YYYY-MM-DD');
    const isToday = dateStr === todayDateStr;
    const sessions = workingHours[dayKey];

    if (!sessions || sessions.length === 0) continue;

    const unavTimes = unavailableTimes[dayKey] || [];
    const bookedTimes = validAppointments[dateStr] || [];
    const slotsForDay: string[] = [];
    const minMinutesAhead = nowMinutes + appointmentConfig.booking_lead_time;

    for (const session of sessions) {
      let startMin = timeStringToMinutes(session.start);
      const endMin = timeStringToMinutes(session.end);

      while (startMin + appointmentDuration <= endMin) {
        const slot: TimeRange = {
          start: startMin,
          end: startMin + appointmentDuration,
        };

        // for today, skip slots that have already passed or don't meet lead time
        if (isToday) {
          // skip slots that have already ended
          if (slot.end <= nowMinutes) {
            startMin = slot.end + bufferTime;
            continue;
          }

          // skip slots that don't meet the minimum lead time requirement
          if (slot.start < minMinutesAhead) {
            startMin = slot.end + bufferTime;
            continue;
          }
        }

        // check if this slot overlaps with any unavailable time or already booked appointments
        const hasConflict =
          unavTimes.some((unav) =>
            overlaps(slot, {
              start: timeStringToMinutes(unav.start),
              end: timeStringToMinutes(unav.end),
            }),
          ) || bookedTimes.some((appt) => overlaps(slot, appt));

        // psuh the time slot if there's no conflict
        if (!hasConflict) {
          const slotString = `${minutesToTime(slot.start)} - ${minutesToTime(
            slot.end,
          )}`;
          slotsForDay.push(slotString);
        }
        // proceed to the next time slot
        startMin = slot.end + bufferTime;
      }
    }

    // if there are slots for this day, save them
    if (slotsForDay.length) {
      slots[dateStr] = slotsForDay;
      workingDayCount++;
    }
  }

  return slots;
}

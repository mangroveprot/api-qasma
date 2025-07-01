import moment from 'moment-timezone';

export const getDateTime = moment.tz('Asia/Manila').toDate();
export const formatDate = (date: Date | string): string => {
  return moment(date).format('YYYY-MM-DD');
};

export type TimeRange = { start: number; end: number };
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

type WorkingSession = {
  start: string;
  end: string;
};

interface WorkingHours {
  [day: string]: WorkingSession[];
}

interface UnavailableTimes {
  [day: string]: { start: string; end: string }[];
}

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

function getDayKeyFromDate(date: Date): Day {
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

export function generateAppointmentSlots(
  workingHours: WorkingHours,
  unavailableTimes: UnavailableTimes,
  appointmentDuration: number,
  bufferTime: number,
  existingAppointments: {
    scheduledAt: string;
    scheduledEndAt: string;
    status: string;
    cancellation: {
      cancelledAt: string | null;
    };
  }[],
  currentDate: Date,
): any {
  const slots: Record<string, string[]> = {};
  const now = currentDate;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

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

  while (workingDayCount < 14) {
    const currentDay = moment(now).add(offset++, 'days').toDate();
    const dayKey = getDayKeyFromDate(currentDay);

    if (!dayKey || !availableDays.includes(dayKey)) continue;

    workingDayCount++;

    const dateStr = formatDate(currentDay);
    const isToday = dateStr === formatDate(now);
    const sessions = workingHours[dayKey];

    if (!sessions || sessions.length === 0) continue;

    const unavTimes = unavailableTimes[dayKey] || [];
    const bookedTimes = validAppointments[dateStr] || [];
    const slotsForDay: string[] = [];
    const minMinutesAhead = nowMinutes + 120;

    for (const session of sessions) {
      let startMin = timeStringToMinutes(session.start);
      const endMin = timeStringToMinutes(session.end);

      while (startMin + appointmentDuration <= endMin) {
        const slot: TimeRange = {
          start: startMin,
          end: startMin + appointmentDuration,
        };

        if (isToday && slot.end <= nowMinutes) {
          startMin = slot.end + bufferTime;
          continue;
        }

        if (isToday && slot.start < minMinutesAhead) {
          startMin = slot.end + bufferTime;
          continue;
        }

        const hasConflict =
          unavTimes.some((unav) =>
            overlaps(slot, {
              start: timeStringToMinutes(unav.start),
              end: timeStringToMinutes(unav.end),
            }),
          ) || bookedTimes.some((appt) => overlaps(slot, appt));

        if (!hasConflict) {
          slotsForDay.push(
            `${minutesToTime(slot.start)} - ${minutesToTime(slot.end)}`,
          );
        }

        startMin = slot.end + bufferTime;
      }
    }

    if (slotsForDay.length) {
      slots[dateStr] = slotsForDay;
    }
  }

  return {
    slots,
    total: Object.values(slots).reduce((acc, curr) => acc + curr.length, 0),
    totalOfDays: Object.keys(slots).length,
  };
}

const workingHours = {
  Monday: [
    { start: '09:00', end: '12:00' },
    { start: '13:00', end: '17:00' },
  ],
  Tuesday: [
    { start: '09:00', end: '12:00' },
    { start: '13:00', end: '17:00' },
  ],
  Wednesday: [
    { start: '09:00', end: '12:00' },
    { start: '13:00', end: '17:00' },
  ],
  Thursday: [
    { start: '09:00', end: '12:00' },
    { start: '13:00', end: '17:00' },
  ],
  Friday: [
    { start: '09:00', end: '12:00' },
    { start: '13:00', end: '17:00' },
  ],
};

const unavailableTimes = {
  Monday: [{ start: '10:00', end: '10:30' }],
  Friday: [{ start: '08:00', end: '08:30' }],
};

const allAppointmentsFromDB = [
  {
    scheduledAt: '2025-06-27T09:30:00.000+08:00',
    scheduledEndAt: '2025-06-27T10:00:00.000+08:00',
    status: 'completed',
    cancellation: { cancelledAt: null },
  },
  {
    scheduledAt: '2025-06-30T09:00:00.000+08:00',
    scheduledEndAt: '2025-06-30T09:30:00.000+08:00',
    status: 'pending',
    cancellation: { cancelledAt: null },
  },
];

const appointmentSlots = generateAppointmentSlots(
  workingHours,
  unavailableTimes,
  60,
  10,
  allAppointmentsFromDB,
  getDateTime,
);

console.log(appointmentSlots);

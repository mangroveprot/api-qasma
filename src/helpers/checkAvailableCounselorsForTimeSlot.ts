import { IAppointmentModel } from '../apps/appointment/models/appointment.model';
import { Status } from '../apps/appointment/types';
import {
  formatDate,
  getDayKeyFromDate,
  TimeRange,
  timeStringToMinutes,
  WorkingSession,
} from './date-and-time';

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function checkAvailableCounselorsForTimeSlot({
  counselors,
  startTime,
  endTime,
  existingAppointments,
}: {
  counselors: any[];
  startTime: Date;
  endTime: Date;
  existingAppointments: IAppointmentModel[];
}): Array<{
  id: string;
  name: string;
  email?: string;
  specialization?: string;
  experience?: string;
}> {
  const requestedSlot: TimeRange = {
    start: startTime.getHours() * 60 + startTime.getMinutes(),
    end: endTime.getHours() * 60 + endTime.getMinutes(),
  };

  const dateStr = formatDate(startTime);
  const dayKey = getDayKeyFromDate(startTime);

  if (!dayKey) {
    return [];
  }

  const existingAppointmentsForDate = existingAppointments
    .filter((appointment) => {
      if (
        appointment.status === 'cancelled' ||
        appointment.cancellation?.cancelledAt
      ) {
        return false;
      }

      const isStatusValid =
        appointment.status === Status.Approved ||
        appointment.status === Status.Pending;

      if (!isStatusValid) return false;

      const apptDate = formatDate(new Date(appointment.scheduledAt));
      return apptDate === dateStr;
    })
    .map((appointment) => ({
      counselorId: appointment.counselorId,
      timeRange: {
        start:
          new Date(appointment.scheduledAt).getHours() * 60 +
          new Date(appointment.scheduledAt).getMinutes(),
        end:
          new Date(appointment.scheduledEndAt).getHours() * 60 +
          new Date(appointment.scheduledEndAt).getMinutes(),
      },
    }));

  const availableCounselors = counselors
    .filter((counselor) => {
      const counselorUnavailable =
        counselor.other_info?.unavailableTimes?.[dayKey] || [];

      const isEntireDayUnavailable = counselorUnavailable.some(
        (unavailableTime: WorkingSession) => {
          const unavailableSlot = {
            start: timeStringToMinutes(unavailableTime.start),
            end: timeStringToMinutes(unavailableTime.end),
          };
          return unavailableSlot.start === 0 && unavailableSlot.end >= 1439;
        },
      );

      if (isEntireDayUnavailable) {
        return false;
      }

      const hasUnavailableConflict = counselorUnavailable.some(
        (unavailableTime: WorkingSession) => {
          const unavailableSlot = {
            start: timeStringToMinutes(unavailableTime.start),
            end: timeStringToMinutes(unavailableTime.end),
          };
          return overlaps(requestedSlot, unavailableSlot);
        },
      );

      if (hasUnavailableConflict) {
        return false;
      }

      const counselorAppointments = existingAppointmentsForDate.filter(
        (appt) => appt.counselorId === counselor.id,
      );

      const hasAppointmentConflict = counselorAppointments.some((appt) =>
        overlaps(requestedSlot, appt.timeRange),
      );

      if (hasAppointmentConflict) {
        return false;
      }

      return true;
    })
    .map((counselor) => ({
      id: counselor.idNumber,
      name: `${counselor.first_name} ${counselor.last_name}`,
      email: counselor.email,
      specialization: counselor.other_info?.specialization,
      experience: counselor.other_info?.experience,
    }));

  return availableCounselors;
}

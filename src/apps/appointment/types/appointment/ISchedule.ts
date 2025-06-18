export type TScheduleStatus =
  | 'available'
  | 'booked'
  | 'cancelled'
  | 'completed';

export interface ISchedule {
  scheduleId: string;
  appointmentId: string;
  counselorId: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  scheduleStatus: TScheduleStatus;
}

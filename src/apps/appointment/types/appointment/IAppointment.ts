export type TStatus = 'pending' | 'approved' | 'completed' | 'cancelled';
export type TCheckInStatus = 'pending' | 'checked-in' | 'missed';

export interface IAppointment {
  appointmentId: string;
  studentId: string;
  scheduleDate: string;
  scheduleTime: string;
  appointmentCategory: string;
  appointmentType: string;
  description: string;
  status: TStatus;
  checkInStatus: TCheckInStatus;
  checkInTime?: Date;
  staffId: string;
  counselorId?: string;
  scheduleId?: string;
  qrCodeData?: string;
}

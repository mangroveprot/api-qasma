import { Status, CheckInStatus } from './index';

export type TCheckInStatus = (typeof CheckInStatus)[keyof typeof CheckInStatus];

export type TStatus = (typeof Status)[keyof typeof Status];

export interface IAppointment {
  appointmentId: string;
  studentId: string;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  appointmentCategory: string;
  appointmentType: string;
  description: string;
  status: TStatus;
  checkInStatus: TCheckInStatus;
  checkInTime?: Date;
  staffId?: string;
  counselorId?: string;
  qrCode?: {
    token: string; //qr token
    scannedById?: string; // scanned by who?
    scannedAt?: Date;
  };
  cancellation?: {
    cancelledById: string; // ID of the user who cancelled
    reason: string;
    cancelledAt: Date;
  };
}

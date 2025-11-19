export const NotificationType = {
  AppointmentCancelled: 'APPOINTMENT_CANCELLED',
  AppointmentRescheduled: 'APPOINTMENT_RESCHEDULED',
  AppointmentConfirmed: 'APPOINTMENT_CONFIRMED',
  AppointmentCompleted: 'APPOINTMENT_COMPLETED',
  CheckInReminder: 'CHECK_IN_REMINDER',
} as const;

export type TNotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationStatus = {
  Pending: 'pending',
  Sent: 'sent',
  Failed: 'failed',
  Read: 'read',
} as const;

export type TNotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

/**
 * Appointment domain events.
 *
 * When something important happens in appointments (create, reschedule, cancel,
 * reminder sent), the appointment service emits one of these events. The
 * activity-log listener subscribes and writes to the log—no direct dependency
 * on ActivityLogService in the appointment service.
 */
export const AppointmentEvents = {
  CREATED: 'appointment:created',
  RESCHEDULED: 'appointment:rescheduled',
  CANCELLED: 'appointment:cancelled',
  REMINDER_SENT: 'appointment:reminder_sent',
  OVERDUE: 'appointment:overdue',
} as const;

export type AppointmentCreatedPayload = {
  userId: string;
  appointmentId: string;
};

export type AppointmentRescheduledPayload = {
  userId: string;
  appointmentId: string;
  oldDate: { start: Date; end: Date };
  newDate: { start: Date; end: Date };
  reason: string | null;
};

export type AppointmentCancelledPayload = {
  userId: string;
  appointmentId: string;
  reason: string | null;
};

export type AppointmentReminderSentPayload = {
  userId: string;
  appointmentId: string;
};

export type AppointmentOverduePayload = {
  userId: string;
  appointmentId: string;
};

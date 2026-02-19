import {
  eventBus,
  AppointmentEvents,
} from '../../../common/shared/events';
import type {
  AppointmentCreatedPayload,
  AppointmentRescheduledPayload,
  AppointmentCancelledPayload,
  AppointmentReminderSentPayload,
} from '../../../common/shared/events';
import ActivityLogService from '../services/activityLog.service';

/**
 * Subscribes to appointment domain events and writes to the activity log.
 *
 * AppointmentService only emits events (e.g. appointment:created). This
 * listener is the only place that turns those events into log entries—
 * keeping the appointment service free of ActivityLogService imports.
 */
export function registerAppointmentActivityListeners(): void {
  eventBus.on(
    AppointmentEvents.CREATED,
    (payload: AppointmentCreatedPayload) => {
      void ActivityLogService.logGeneric({
        userId: payload.userId,
        category: 'appointment',
        action: 'appointment_created',
        relatedId: payload.appointmentId,
        details: {},
      });
    },
  );

  eventBus.on(
    AppointmentEvents.RESCHEDULED,
    (payload: AppointmentRescheduledPayload) => {
      void ActivityLogService.logAppointmentReschedule(
        payload.userId,
        payload.appointmentId,
        payload.oldDate,
        payload.newDate,
        payload.reason,
        {},
      );
    },
  );

  eventBus.on(
    AppointmentEvents.CANCELLED,
    (payload: AppointmentCancelledPayload) => {
      void ActivityLogService.logAppointmentCancellation(
        payload.userId,
        payload.appointmentId,
        payload.reason,
        {},
      );
    },
  );

  eventBus.on(
    AppointmentEvents.REMINDER_SENT,
    (payload: AppointmentReminderSentPayload) => {
      void ActivityLogService.logGeneric({
        userId: payload.userId,
        category: 'appointment',
        action: 'appointment_reminder_sent',
        relatedId: payload.appointmentId,
        details: {},
      });
    },
  );
}

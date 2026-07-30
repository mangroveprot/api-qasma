import moment from 'moment-timezone';
import { config } from '../../../core/config';
import { IAppointmentModel } from '../../appointment/models/appointment.model';
import { NotificationType } from '../types';

export class NotificationMessages {
  private static formatDateTime(date: Date) {
    const m = moment.utc(date);
    return {
      date: m.format('MMMM DD, YYYY'),
      time: m.format('h:mm A'),
    };
  }

  static buildCancelledNotification(appointment: IAppointmentModel) {
    const { date, time } = this.formatDateTime(appointment.scheduledStartAt);

    return {
      type: NotificationType.AppointmentCancelled,
      title: 'Appointment Cancelled',
      body: `The appointment on ${date} at ${time} has been cancelled.`,
      data: {
        appointmentId: appointment.appointmentId,
        scheduledStartAt: appointment.scheduledStartAt.toISOString(),
        scheduledEndAt: appointment.scheduledEndAt.toISOString(),
        reason: appointment.cancellation?.reason || 'No reason provided',
        cancelledAt: appointment.cancellation?.cancelledAt?.toISOString(),
        cancelledBy: appointment.cancellation?.cancelledById,
      },
    };
  }

  static buildRescheduledNotification(
    oldAppointment: IAppointmentModel,
    newAppointment: IAppointmentModel,
  ) {
    const old = this.formatDateTime(oldAppointment.scheduledStartAt);
    const newDT = this.formatDateTime(newAppointment.scheduledStartAt);

    return {
      type: NotificationType.AppointmentRescheduled,
      title: 'Appointment Rescheduled',
      body: `The appointment has been moved from ${old.date} at ${old.time} to ${newDT.date} at ${newDT.time}.`,
      data: {
        appointmentId: newAppointment.appointmentId,
        previousStart: oldAppointment.scheduledStartAt.toISOString(),
        previousEnd: oldAppointment.scheduledEndAt.toISOString(),
        newStart: newAppointment.scheduledStartAt.toISOString(),
        newEnd: newAppointment.scheduledEndAt.toISOString(),
        rescheduledBy: newAppointment.reschedule?.rescheduledBy,
        remarks: newAppointment.reschedule?.remarks,
      },
    };
  }

  static buildConfirmedNotification(appointment: IAppointmentModel) {
    const { date, time } = this.formatDateTime(appointment.scheduledStartAt);

    return {
      type: NotificationType.AppointmentConfirmed,
      title: 'Appointment Confirmed',
      body: `The appointment on ${date} at ${time} has been approved.`,
      data: {
        appointmentId: appointment.appointmentId,
        scheduledStartAt: appointment.scheduledStartAt.toISOString(),
        scheduledEndAt: appointment.scheduledEndAt.toISOString(),
        appointmentCategory: appointment.appointmentCategory,
        appointmentType: appointment.appointmentType,
        counselorId: appointment.counselorId,
        staffId: appointment.staffId,
      },
    };
  }

  static buildCompletedNotification(appointment: IAppointmentModel) {
    const { date, time } = this.formatDateTime(appointment.scheduledStartAt);

    return {
      type: NotificationType.AppointmentCompleted,
      title: 'Appointment Completed',
      body: `The appointment on ${date} at ${time} has been completed.`,
      data: {
        appointmentId: appointment.appointmentId,
        scheduledStartAt: appointment.scheduledStartAt.toISOString(),
        scheduledEndAt: appointment.scheduledEndAt.toISOString(),
        appointmentCategory: appointment.appointmentCategory,
        appointmentType: appointment.appointmentType,
        counselorId: appointment.counselorId,
        staffId: appointment.staffId,
        checkInTime: appointment.checkInTime?.toISOString(),
        status: appointment.status,
      },
    };
  }

  static buildOverdueNotification(appointment: IAppointmentModel) {
    const { date, time } = this.formatDateTime(appointment.scheduledStartAt);

    return {
      type: NotificationType.AppointmentCancelled,
      title: 'Missed Appointment',
      body: `The appointment on ${date} at ${time} is now overdue.`,
      data: {
        appointmentId: appointment.appointmentId,
        scheduledStartAt: appointment.scheduledStartAt.toISOString(),
        scheduledEndAt: appointment.scheduledEndAt.toISOString(),
        cancelledBy: 'system',
        reason: 'Overdue appointment',
      },
    };
  }

  static buildGeneralNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    return {
      type: NotificationType.General,
      title: title,
      body: body,
      data: data || {},
    };
  }
}

export default NotificationMessages;

import {
  ErrorResponse,
  ErrorResponseType,
  QRCodeService,
  SuccessResponseType,
} from '../../../common/shared';
import { BaseService } from '../../../core/engine';
import { IUserModel, Role, UserService } from '../../users';
import AppointmentModel, {
  IAppointmentModel,
} from '../models/appointment.model';
import { AppointmentRepository } from '../repositories';
import { CheckInStatus, Status } from '../types';
import {
  formatDate,
  generateAppointmentSlots,
  getDateTime,
  mergedCounselorsUnavailableTimes,
  UnavailableTimes,
} from '../../../helpers';
import { AppoinmentConfigService } from '../../appointment-config/services';
import { IAppointmentConfig } from '../../appointment-config/types';
import moment from 'moment';
import { checkAvailableCounselorsForTimeSlot } from '../../../helpers/checkAvailableCounselorsForTimeSlot';
import { NotificationService } from '../../notifications/services';
import { NotificationMessages } from '../../notifications/utils';
import { config } from '../../../core/config';
import { eventBus, AppointmentEvents } from '../../../common/shared/events';

class AppointmentService extends BaseService<
  IAppointmentModel,
  AppointmentRepository
> {
  constructor() {
    const appointmentRepo = new AppointmentRepository(AppointmentModel);
    super(appointmentRepo);
    this.allowedFilterFields = [
      'status',
      'updatedAt',
      'studentId',
      'reminderSent',
    ]; // for safety searching
  }

  private getAppointmentUserIds(
    appointment: IAppointmentModel,
    excludeRoles: (typeof Role)[keyof typeof Role][] = [],
  ): string[] {
    const userMap = {
      [Role.Student]: appointment.studentId,
      [Role.Counselor]: appointment.counselorId,
      [Role.Staff]: appointment.staffId,
    };

    return (Object.keys(userMap) as (keyof typeof userMap)[])
      .filter((role) => !excludeRoles.includes(role))
      .map((role) => userMap[role])
      .filter(Boolean) as string[];
  }

  async createAppointment(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const idNumber = payload.studentId;
      const userResponse = (await UserService.findOne({
        idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The student ID was not found..',
        );
      }

      if (userResponse.document?.role !== 'student') {
        throw new ErrorResponse(
          'FORBIDDEN_ERROR',
          'Only students are allowed to make appointments.',
        );
      }

      const createAppointmentRes = (await this.create({
        ...payload,
        reminderSent: false,
      })) as SuccessResponseType<IAppointmentModel>;

      if (!createAppointmentRes.success || !createAppointmentRes.document) {
        throw createAppointmentRes.error;
      }

      const staffResponse = await UserService.findAll({
        query: { role: Role.Staff },
      });

      if (
        staffResponse.success &&
        (staffResponse as SuccessResponseType<IUserModel>).documents
      ) {
        const staffMembers =
          (staffResponse as SuccessResponseType<IUserModel>).documents || [];
        const staffIdNumbers = staffMembers.map((staff) => staff.idNumber);

        if (staffIdNumbers.length > 0) {
          const notification = NotificationMessages.buildGeneralNotification(
            'New Appointment Created',
            `A new appointment has been scheduled by student ${userResponse.document.idNumber}`,
            {
              appointmentId: createAppointmentRes.document.appointmentId,
              studentId: createAppointmentRes.document.studentId,
              scheduledStartAt: createAppointmentRes.document.scheduledStartAt,
            },
          );

          await NotificationService.queueNotification({
            idNumbers: staffIdNumbers,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data,
          });
        }
      }

      eventBus.emit(AppointmentEvents.CREATED, {
        userId: idNumber,
        appointmentId: createAppointmentRes.document.appointmentId,
      });

      return {
        success: true,
        document: {
          appointment: createAppointmentRes.document,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async updateAppointment(
    payload: any,
  ): Promise<SuccessResponseType<IAppointmentModel> | ErrorResponseType> {
    const { appointmentId, ...restPayload } = payload;

    try {
      const appointmentResponse = (await this.findOne({
        appointmentId,
      })) as SuccessResponseType<IAppointmentModel>;

      if (!appointmentResponse.success || !appointmentResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The appointment was not found.',
        );
      }

      const oldAppointment = appointmentResponse.document;

      const isReschedule =
        restPayload.scheduledStartAt &&
        new Date(restPayload.scheduledStartAt).getTime() !==
          oldAppointment.scheduledStartAt.getTime();

      if (isReschedule) {
        restPayload.reschedule = {
          rescheduledBy: restPayload.reschedule?.rescheduledBy || 'system',
          remarks: restPayload.reschedule?.remarks || null,
          rescheduledAt: getDateTime(),
          previousStart: oldAppointment.scheduledStartAt,
          previousEnd: oldAppointment.scheduledEndAt,
        };
      }

      const updateResponse = (await this.update(
        { appointmentId },
        {
          ...restPayload,
          reminderSent: isReschedule ? false : restPayload.reminderSent,
        },
      )) as SuccessResponseType<IAppointmentModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      // send notification if time is change
      if (isReschedule && updateResponse.document) {
        const notification = NotificationMessages.buildRescheduledNotification(
          oldAppointment,
          updateResponse.document,
        );

        const userIds = this.getAppointmentUserIds(updateResponse.document);

        await NotificationService.queueNotification({
          idNumbers: userIds,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });

        eventBus.emit(AppointmentEvents.RESCHEDULED, {
          userId: oldAppointment.studentId,
          appointmentId: oldAppointment.appointmentId,
          oldDate: {
            start: oldAppointment.scheduledStartAt,
            end: oldAppointment.scheduledEndAt,
          },
          newDate: {
            start: updateResponse.document.scheduledStartAt,
            end: updateResponse.document.scheduledEndAt,
          },
          reason: restPayload.reschedule?.remarks ?? null,
        });
      }

      return {
        success: true,
        document: updateResponse.document,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  // need to optimize
  async cancelAppointment(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { appointmentId, cancellation } = payload;
      const appointmentResponse = (await this.findOne({
        appointmentId,
      })) as SuccessResponseType<IAppointmentModel>;

      if (!appointmentResponse.success || !appointmentResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The appointment was not found.',
        );
      }

      let operationResponse;
      const appointment = appointmentResponse.document;

      if (appointment.status == Status.Pending) {
        const updateResponse = (await this.update(
          { appointmentId: appointment.appointmentId },
          {
            status: Status.Cancelled,
            cancellation,
          },
        )) as SuccessResponseType<IAppointmentModel>;

        if (!updateResponse.success) {
          throw updateResponse.error;
        }

        const deleteResponse = await this.delete(
          { appointmentId: appointment.appointmentId },
          true,
        );

        if (!deleteResponse.success) {
          throw deleteResponse.error;
        }

        operationResponse = updateResponse;
      } else {
        operationResponse = (await this.update(
          { appointmentId: appointment.appointmentId },
          {
            status: Status.Cancelled,
            cancellation,
          },
        )) as SuccessResponseType<IAppointmentModel>;

        if (!operationResponse.success) {
          throw operationResponse.error;
        }
      }

      if (operationResponse.document) {
        const notification = NotificationMessages.buildCancelledNotification(
          operationResponse.document,
        );

        const userIds = this.getAppointmentUserIds(operationResponse.document);

        await NotificationService.queueNotification({
          idNumbers: userIds,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });

        eventBus.emit(AppointmentEvents.CANCELLED, {
          userId: cancellation?.cancelledById ?? appointment.studentId,
          appointmentId: appointment.appointmentId,
          reason: cancellation?.reason ?? null,
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  async acceptAppointment(
    payload: any,
  ): Promise<SuccessResponseType<IAppointmentModel> | ErrorResponseType> {
    const { appointmentId, studentId, counselorId } = payload;
    try {
      const appointmentResponse = (await this.findOne({
        appointmentId,
      })) as SuccessResponseType<IAppointmentModel>;

      if (!appointmentResponse.success || !appointmentResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The appointment was not found.',
        );
      }

      const qrToken = await QRCodeService.hashQRData({
        appointmentId,
        studentId,
        counselorId,
      });

      const { appointmentId: _appointmentId, ...restPayload } = payload;

      const updatePayload = {
        ...restPayload,
        qrCode: {
          token: qrToken,
        },
      };

      const updateResponse = (await this.update(
        { appointmentId },
        { ...updatePayload },
      )) as SuccessResponseType<IAppointmentModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      if (
        updateResponse.document &&
        updateResponse.document.status === Status.Approved
      ) {
        const notification = NotificationMessages.buildConfirmedNotification(
          updateResponse.document,
        );

        const userIds = this.getAppointmentUserIds(updateResponse.document, [
          Role.Counselor,
        ]);

        await NotificationService.queueNotification({
          idNumbers: userIds,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });

        if (counselorId) {
          const notification = NotificationMessages.buildGeneralNotification(
            'New Appointment Assigned',
            `You have been assigned to a new appointment with student ${studentId}`,
            {
              appointmentId: updateResponse.document.appointmentId,
              studentId: updateResponse.document.studentId,
              counselorId: updateResponse.document.counselorId,
              scheduledStartAt: updateResponse.document.scheduledStartAt,
            },
          );

          await NotificationService.queueNotification({
            idNumbers: [counselorId],
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data,
          });
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  async verifyAppointment(
    payload: any,
  ): Promise<SuccessResponseType<IAppointmentModel> | ErrorResponseType> {
    const { appointmentId } = payload;

    try {
      const appointmentResponse = (await this.findOne({
        appointmentId,
      })) as SuccessResponseType<IAppointmentModel>;

      if (!appointmentResponse.success || !appointmentResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The appointment was not found.',
        );
      }

      const { token, ...restPayload } = payload;

      const verifyQRToken = await QRCodeService.verifyQRToken(
        restPayload,
        token,
      );

      if (!verifyQRToken.success) {
        throw verifyQRToken.error;
      }

      const updateResponse = (await this.update(
        { appointmentId },
        {
          status: Status.Completed,
          checkInStatus: CheckInStatus.CheckIn,
          checkInTime: getDateTime(),
          qrCode: {
            token: token,
            scannedById: String(payload.counselorId),
            scannedAt: getDateTime(),
          },
        },
      )) as SuccessResponseType<IAppointmentModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      // send completion notification
      if (
        updateResponse.document &&
        updateResponse.document.status === Status.Completed
      ) {
        const notification = NotificationMessages.buildCompletedNotification(
          updateResponse.document,
        );

        const userIds = this.getAppointmentUserIds(updateResponse.document);

        await NotificationService.queueNotification({
          idNumbers: userIds,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  async generateAppointmentSlots(
    duration: string,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const appointmentDuration: number = Number(duration);

      // get all config, all counselors, and appointments
      // TODO: Optimized - cached this instead
      const [appointmentConfigRes, counselorRes, appointmentRes] =
        await Promise.all([
          AppoinmentConfigService.findOne({}),
          UserService.findAll({
            query: { role: Role.Counselor, verified: true, active: true },
          }),
          this.findAll(),
        ]);

      const counselors =
        (counselorRes as SuccessResponseType<any>).documents || [];

      const appointments =
        (appointmentRes as SuccessResponseType<IAppointmentModel>).documents ||
        [];

      const appointmentConfig = (
        appointmentConfigRes as SuccessResponseType<IAppointmentConfig>
      ).document;

      if (!counselors) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'No counselor is currently assigned. Please contact the administrator.',
        );
      }

      if (!appointmentConfig) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'Missing appoinment config, maybe its empty.',
        );
      }

      const allUnavailable: UnavailableTimes[] = counselors.map(
        (counselor) => counselor.other_info?.unavailableTimes,
      );

      // get the current and upcoming appointments and also must be approved or pending
      const upcomingAppointments = appointments.filter((appointment) => {
        const scheduledAt = moment(appointment.scheduledStartAt);
        const isStatusValid =
          appointment.status === Status.Approved ||
          appointment.status === Status.Pending;

        return isStatusValid && scheduledAt.isSameOrAfter(getDateTime());
      });

      const getAvailableSlots = generateAppointmentSlots({
        unavailableTimes: allUnavailable,
        appointmentDuration: appointmentDuration,
        existingAppointments: upcomingAppointments,
        appointmentConfig: appointmentConfig,
      });

      return { success: true, document: getAvailableSlots };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  async checkCounselorAvailability(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { scheduledStartAt, scheduledEndAt } = payload;
      const [counselorRes, appointmentRes] = await Promise.all([
        UserService.findAll({
          query: { role: Role.Counselor, verified: true, active: true },
        }),
        this.findAll(),
      ]);

      const counselors =
        (counselorRes as SuccessResponseType<any>).documents || [];
      const appointments =
        (appointmentRes as SuccessResponseType<IAppointmentModel>).documents ||
        [];

      if (!counselors || counselors.length === 0) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'No counselors are currently available.',
        );
      }

      const requestedStart = moment(scheduledStartAt).toDate();
      const requestedEnd = moment(scheduledEndAt).toDate();

      if (requestedStart >= requestedEnd) {
        throw new ErrorResponse(
          'VALIDATION_ERROR',
          'Start time must be before end time.',
        );
      }

      const availableCounselors = checkAvailableCounselorsForTimeSlot({
        counselors,
        startTime: requestedStart,
        endTime: requestedEnd,
        existingAppointments: appointments,
      });

      return {
        success: true,
        documents: availableCounselors,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  async sendAppointmentReminders(): Promise<
    SuccessResponseType<any> | ErrorResponseType
  > {
    try {
      const now = getDateTime();
      const nowMoment = moment(now).tz(config.timeZone);
      const oneHourFromNow = nowMoment.clone().add(1, 'hour');

      const reminderWindowStart = oneHourFromNow.clone().subtract(5, 'minutes');
      const reminderWindowEnd = oneHourFromNow.clone().add(5, 'minutes');

      const appointmentsResponse = (await this.findAll({
        query: {
          status: Status.Approved,
          scheduledStartAt: {
            $gte: reminderWindowStart.toDate(),
            $lte: reminderWindowEnd.toDate(),
          },
          reminderSent: { $ne: true },
        },
      })) as SuccessResponseType<IAppointmentModel>;

      if (
        !appointmentsResponse.success ||
        !appointmentsResponse.documents ||
        appointmentsResponse.documents.length === 0
      ) {
        return {
          success: true,
          document: { message: 'No appointments to remind', count: 0 },
        };
      }

      const appointmentsToRemind = appointmentsResponse.documents;

      await Promise.all(
        appointmentsToRemind.map(async (appointment) => {
          await this.update(
            { appointmentId: appointment.appointmentId },
            { reminderSent: true },
          );

          const appointmentTime = moment(appointment.scheduledStartAt)
            .utc()
            .tz(config.timeZone, true)
            .format('h:mm A');

          const notification = NotificationMessages.buildGeneralNotification(
            'Appointment Reminder',
            `Your appointment starts in 1 hour at ${appointmentTime}`,
            {
              appointmentId: appointment.appointmentId,
              studentId: appointment.studentId,
              counselorId: appointment.counselorId,
              scheduledStartAt: appointment.scheduledStartAt,
            },
          );

          const userIds = this.getAppointmentUserIds(appointment, [Role.Staff]);

          await NotificationService.queueNotification({
            idNumbers: userIds,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data,
          });

          eventBus.emit(AppointmentEvents.REMINDER_SENT, {
            userId: appointment.studentId,
            appointmentId: appointment.appointmentId,
          });
        }),
      );

      return {
        success: true,
        document: {
          message: 'Reminders sent successfully',
          count: appointmentsToRemind.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  async markOverdueAppointments(): Promise<
    SuccessResponseType<any> | ErrorResponseType
  > {
    try {
      const now = moment().tz(config.timeZone);

      const overdueAppointmentsResponse = (await this.findAll({
        query: {
          status: {
            $in: [Status.Pending, Status.Approved],
          },
          scheduledStartAt: {
            $lt: now.toDate(),
          },
        },
      })) as SuccessResponseType<IAppointmentModel>;

      if (
        !overdueAppointmentsResponse.success ||
        !overdueAppointmentsResponse.documents ||
        overdueAppointmentsResponse.documents.length === 0
      ) {
        return {
          success: true,
          document: {
            message: 'No overdue appointments found',
            count: 0,
          },
        };
      }

      const overdueAppointments = overdueAppointmentsResponse.documents;

      await Promise.all(
        overdueAppointments.map(async (appointment) => {
          await this.update(
            {
              appointmentId: appointment.appointmentId,
            },
            {
              status: Status.Overdue,
            },
          );

          const notification =
            NotificationMessages.buildOverdueNotification(appointment);

          const userIds = this.getAppointmentUserIds(appointment);

          await NotificationService.queueNotification({
            idNumbers: userIds,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data,
          });

          eventBus.emit(AppointmentEvents.OVERDUE, {
            userId: appointment.studentId,
            appointmentId: appointment.appointmentId,
          });
        }),
      );

      return {
        success: true,
        document: {
          message: 'Appointments marked as overdue',
          count: overdueAppointments.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }
}

export default new AppointmentService();

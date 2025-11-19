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

class AppointmentService extends BaseService<
  IAppointmentModel,
  AppointmentRepository
> {
  constructor() {
    const appointmentRepo = new AppointmentRepository(AppointmentModel);
    super(appointmentRepo);
    this.allowedFilterFields = ['status', 'updatedAt', 'studentId']; // for safety searching
  }

  private getAppointmentUserIds(appointment: IAppointmentModel): string[] {
    const userIds: string[] = [appointment.studentId];

    if (appointment.counselorId) {
      userIds.push(appointment.counselorId);
    }

    if (appointment.staffId) {
      userIds.push(appointment.staffId);
    }

    return userIds;
  }

  async createAppointment(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const idNumber = payload.studentId; // get the student id as notation like this to match the user model
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

      const createAppointmentRes = (await this.create(
        payload,
      )) as SuccessResponseType<IAppointmentModel>;

      if (!createAppointmentRes.success || !createAppointmentRes.document) {
        throw createAppointmentRes.error;
      }

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
        { ...restPayload },
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

  async cancelAppointment(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { appointmentId, ...newPayload } = payload;
      const appointmentResponse = (await this.findOne({
        appointmentId,
      })) as SuccessResponseType<IAppointmentModel>;

      if (!appointmentResponse.success || !appointmentResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The appointment was not found.',
        );
      }

      const updateResponse = (await this.update(
        { appointmentId },
        { ...newPayload, status: Status.Cancelled },
      )) as SuccessResponseType<IAppointmentModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      // cancellation notification
      if (updateResponse.document) {
        const notification = NotificationMessages.buildCancelledNotification(
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
          UserService.findAll({ query: { role: Role.Counselor } }),
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

      const allUnavailable: UnavailableTimes[] = counselors
        .filter((counselor) => counselor.other_info) // filter counselor doesnt have otherinfo
        .map((counselor) => counselor.other_info.unavailableTimes);

      // get the current and upcoming appointments and also must be approved or pending
      const upcomingAppointments = appointments.filter((appointment) => {
        const scheduledAt = moment(appointment.scheduledStartAt);
        const isStatusValid =
          appointment.status === Status.Approved ||
          appointment.status === Status.Pending;

        return isStatusValid && scheduledAt.isSameOrAfter(getDateTime());
      });

      const mergedAllCounselorTime =
        mergedCounselorsUnavailableTimes(allUnavailable);

      const getAvailableSlots = generateAppointmentSlots({
        unavailableTimes: mergedAllCounselorTime,
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
        UserService.findAll({ query: { role: Role.Counselor } }),
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
}

export default new AppointmentService();

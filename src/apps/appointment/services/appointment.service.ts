import {
  ErrorResponse,
  ErrorResponseType,
  QRCodeService,
  SuccessResponseType,
} from '../../../common/shared';
import { BaseService } from '../../../core/engine';
import { IUserModel, UserService } from '../../users';
import AppointmentModel, {
  IAppointmentModel,
} from '../models/appointment.model';
import { AppointmentRepository } from '../repositories';
import { CheckInStatus, Status } from '../types';
import { getDateTime } from '../../../helpers';

class AppointmentService extends BaseService<
  IAppointmentModel,
  AppointmentRepository
> {
  constructor() {
    const appointmentRepo = new AppointmentRepository(AppointmentModel);
    super(appointmentRepo);
    this.allowedFilterFields = ['status']; // for safety searching
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

      const updateResponse = (await this.update(
        { appointmentId },
        { ...restPayload },
      )) as SuccessResponseType<IAppointmentModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
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

      if (newPayload.status !== Status.Cancelled) {
        throw new ErrorResponse(
          'BAD_REQUEST',
          'The request payload is invalid.',
          ['Status must be cancelled.'],
        );
      }

      const updateResponse = (await this.update(
        { appointmentId },
        { ...newPayload },
      )) as SuccessResponseType<IAppointmentModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
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

      //no need to verify counselor cause the verify QR token is the one who handle
      const verifyQRToken = await QRCodeService.verifyQRToken(
        restPayload,
        token,
      );

      if (!verifyQRToken.success) {
        throw verifyQRToken.error;
      }

      const updatePayload = {
        status: Status.Completed,
        checkInStatus: CheckInStatus.CheckIn,
        checkInTime: getDateTime,
        qrCode: {
          token: token,
          scannedById: payload.counselorId, // scanned by who?
          scannedAt: getDateTime,
        },
      };

      const updateResponse = (await this.update(
        { appointmentId },
        { ...updatePayload },
      )) as SuccessResponseType<IAppointmentModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
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
}

export default new AppointmentService();

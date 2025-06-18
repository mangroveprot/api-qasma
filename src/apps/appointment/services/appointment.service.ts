import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared';
import { BaseService } from '../../../core/engine';
import { IUserModel, UserService } from '../../users';
import AppointmentModel, {
  IAppointmentModel,
} from '../models/appointment.model';
import { AppointmentRepository } from '../repositories';

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
          'The student ID is not registered..',
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
}

export default new AppointmentService();

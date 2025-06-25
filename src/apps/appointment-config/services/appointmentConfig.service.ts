import {
  ErrorResponse,
  ErrorResponseType,
  QRCodeService,
  SuccessResponseType,
} from '../../../common/shared';
import { BaseService } from '../../../core/engine';
import AppointConfigModel, {
  IAppointmentConfigModel,
} from '../models/appointmentConfig.model';
import { AppointmentConfigRepository } from '../repositories';

class AppoinmentConfigService extends BaseService<
  IAppointmentConfigModel,
  AppointmentConfigRepository
> {
  constructor() {
    const appointConfigRepo = new AppointmentConfigRepository(
      AppointConfigModel,
    );
    super(appointConfigRepo);
  }

  async createAppointmentConfig(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const getAllRepsonse =
        (await this.findAll()) as SuccessResponseType<IAppointmentConfigModel>;

      if (getAllRepsonse.success || getAllRepsonse.document) {
        throw new ErrorResponse(
          'FORBIDDEN_ERROR',
          'Config has already been set. The new config is ignored',
        );
      }

      const createResponse = (await this.create(
        payload,
      )) as SuccessResponseType<IAppointmentConfigModel>;

      if (!createResponse.success || !createResponse.document) {
        throw createResponse.error;
      }

      return {
        success: true,
        document: {
          appointmentConfig: createResponse.document,
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

  async updateAppointmentConfig(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { configId, ...restPayload } = payload;

      const findResponse = (await this.findOne({
        configId,
      })) as SuccessResponseType<IAppointmentConfigModel>;

      if (!findResponse.success || !findResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The appointment configuration was not found.',
        );
      }

      const updateResponse = (await this.update(
        { configId },
        { ...restPayload },
      )) as SuccessResponseType<IAppointmentConfigModel>;

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

export default new AppoinmentConfigService();

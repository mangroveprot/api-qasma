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

      if (getAllRepsonse.results) {
        throw new ErrorResponse(
          'FORBIDDEN',
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

  async categoryAndType(): Promise<
    SuccessResponseType<any> | ErrorResponseType
  > {
    let categoryAndType;
    try {
      const result =
        (await this.findAll()) as SuccessResponseType<IAppointmentConfigModel>;

      console.log(result);

      if (!result.documents?.length) {
        throw new ErrorResponse(
          'NOT_FOUND',
          'It looks like no configuration has been set up yet. Please reach out to the admin to create one.',
        );
      }

      const config = result.documents;

      if (Array.isArray(config) && config.length > 0) {
        categoryAndType = config[0].category_and_type;
      }

      return {
        success: true,
        document: categoryAndType,
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
        { restPayload },
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

  async synConfig(
    lastSynced: string,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const response = (await this.findAll({
        lastSynced,
      })) as SuccessResponseType<any>;

      if (!response?.success || !Array.isArray(response.documents)) {
        throw new ErrorResponse(
          'NOT_FOUND',
          'No configuration data found. Please ensure it exists.',
        );
      }

      const firstData = response.documents[0];

      return {
        success: true,
        document: firstData,
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

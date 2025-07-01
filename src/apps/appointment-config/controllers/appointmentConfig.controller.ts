import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';
import { AppoinmentConfigService } from '../services';

class AppointmentConfigController {
  static async createConfig(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AppoinmentConfigService.createAppointmentConfig(
        req.body,
      );
      if (response.success) {
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async updateConfig(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AppoinmentConfigService.updateAppointmentConfig(
        req.body,
      );
      if (response.success) {
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async getAllConfig(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AppoinmentConfigService.findAll(req.body);
      if (response.success) {
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default AppointmentConfigController;

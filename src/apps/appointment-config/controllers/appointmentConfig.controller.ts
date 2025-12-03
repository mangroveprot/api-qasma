import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';
import { AppoinmentConfigService } from '../services';
import moment from 'moment';

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
      const { configId } = req.params;
      const response = await AppoinmentConfigService.updateAppointmentConfig(
        configId,
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

  static async sync(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { lastSynced } = req.params;

      const response = await AppoinmentConfigService.findAll({
        lastSynced: lastSynced,
      });
      if (response.success) {
        ApiResponse.success(res, response, 200);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default AppointmentConfigController;

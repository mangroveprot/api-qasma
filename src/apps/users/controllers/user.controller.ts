import { Request, Response, NextFunction } from 'express';
import {
  ApiResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared';
import { UserService } from '../services';
import moment from 'moment';

class UserController {
  static async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await UserService.create(req.body);
      if (response.success) {
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await UserService.findAll(req.query);
      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async isRegister(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const identifier: string = req.params.identifier;
      const response = await UserService.isRegistered(identifier);

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async getUserProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idNumber: string = req.params.idNumber;
      const response = await UserService.getProfile(idNumber);

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async getCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idNumber = (req as any).payload?.aud as string;
      const response = await UserService.getProfile(idNumber);

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async isActive(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idNumber = (req as any).payload?.aud as string;
      const response = await UserService.isActive(idNumber);

      if (response.success) {
        ApiResponse.success(res, response);
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
      const { idNumber } = req.query;

      const query = idNumber ? { idNumber: idNumber as string } : {};
      const response = await UserService.findAll({
        query: query,
        lastSynced: lastSynced,
        paginate: false,
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

  static async updateFcmToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idNumber = (req as any).payload?.aud as string;
      const { fcmToken } = req.body;

      const response = await UserService.updateFcmToken(idNumber, fcmToken);

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default UserController;

import { Request, Response, NextFunction } from 'express';
import {
  ApiResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared';
import { UserService } from '../services';

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

  static async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.params.uid;
      const response = await UserService.findOne({
        _id: userId,
      });

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
      console.log({ idNumber });
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
}

export default UserController;

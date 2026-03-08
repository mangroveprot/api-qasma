import { Query } from 'mongoose';
import { BaseService } from '../../../core/engine';
import bycrypt from 'bcryptjs';
import { IUserModel, UserModelMongoose } from '../models/mongoose';
import UserStudentMongooseRepository from '../repositories/user.repo';
import {
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared/types';
import { ErrorResponse } from '../../../common/shared/utils';
import { config } from '../../../core/config';
import { eventBus, UserEvents } from '../../../common/shared/events';

class UserService extends BaseService<
  IUserModel,
  UserStudentMongooseRepository
> {
  constructor() {
    const userRepo = new UserStudentMongooseRepository(UserModelMongoose);
    super(userRepo);
    this.allowedFilterFields = [
      'role',
      'email',
      'idNumber',
      'active',
      'verified',
    ];
  }

  async isValidPassword(
    idNumber: string,
    enterdPassword: string,
  ): Promise<SuccessResponseType<{ isValid: boolean }> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!response.success || !response.document) {
        throw response.error;
      }

      const isValid = await bycrypt.compare(
        enterdPassword,
        response.document.password,
      );

      return { success: true, document: { isValid } };
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

  async isRegistered(
    identifier?: string | undefined,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      if (!identifier) {
        throw new ErrorResponse(
          'BAD_REQUEST',
          'ID Number or email is required.',
        );
      }

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      const query = isEmail ? { email: identifier } : { idNumber: identifier };

      const user = (await this.findOne({
        ...query,
      })) as SuccessResponseType<IUserModel>;

      if (user.success && user.document?.verified) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          `This ${isEmail ? 'email' : 'ID number'} is already registered.`,
        );
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
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async getProfile(
    idNumber?: string | undefined,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      if (!idNumber) {
        throw new ErrorResponse('BAD_REQUEST', 'ID Number is required.');
      }

      const user = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!user.success || !user.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      return {
        success: true,
        document: {
          idNumber: user.document.idNumber,
          email: user.document.email,
          role: user.document.role,
          verified: user.document.verified,
          active: user.document.active,
          first_name: user.document.first_name,
          middle_name: user.document.middle_name,
          last_name: user.document.last_name,
          suffix: user.document.suffix,
          gender: user.document.gender,
          date_of_birth: user.document.date_of_birth,
          contact_number: user.document.contact_number,
          address: user.document.address,
          facebook: user.document.facebook,
          other_info: user.document.other_info,
        } as any, // add any to avoid type error, cause the password should not included
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

  async updateProfile(
    idNumber: string,
    payload: any,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const user = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!user.success || !user.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const updateResponse = (await this.update(
        { idNumber: idNumber },
        { ...payload },
      )) as SuccessResponseType<IUserModel>;

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
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async updatePassword(
    idNumber: string,
    newPassword: string,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!response.success || !response.document) {
        throw response.error;
      }

      // const hashedPassword = await bycrypt.hash(
      //   newPassword,
      //   config.bcrypt.saltRound,
      // );

      const updateResponse = (await this.update(
        { idNumber: idNumber },
        { password: newPassword },
      )) as SuccessResponseType<IUserModel>;

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

  async markAsVerified(
    email: string,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        email: email,
      })) as SuccessResponseType<IUserModel>;

      if (!response.success || !response.document) {
        throw response.error;
      }

      const updateResponse = (await this.update(
        { idNumber: response.document.idNumber },
        { verified: true },
      )) as SuccessResponseType<IUserModel>;

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
  async isActive(
    idNumber: string,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!response.success || !response.document) {
        throw response.error;
      }

      return {
        success: true,
        document: { active: response.document.active },
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

  async updateFcmToken(
    idNumber: string,
    fcmToken: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!response.success || !response.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const updateResponse = (await this.update({ idNumber: idNumber }, {
        fcmToken: fcmToken,
      } as any)) as SuccessResponseType<IUserModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      // eventBus.emit(UserEvents.FCM_TOKEN_UPDATED, {
      //   userId: idNumber,
      //   channel: 'push',
      // });

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
}

export default new UserService();

import { Query } from 'mongoose';
import { BaseService } from '../../../core/engine';
import bycrypt from 'bcryptjs';
import {
  IUserStudentDocument,
  UserStudentModelMogoose,
} from '../models/mongoose';
import UserStudentMongooseRepository from '../repositories/user-student.repo';
import {
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared/types';
import { ErrorResponse } from '../../../common/shared/utils';
import { UserProfile } from '../types';
import { config } from '../../../core/config';

class UserService extends BaseService<
  IUserStudentDocument,
  UserStudentMongooseRepository
> {
  constructor() {
    const userRepo = new UserStudentMongooseRepository(UserStudentModelMogoose);
    super(userRepo);
  }

  async isValidPassword(
    userID: string,
    enterdPassword: string,
  ): Promise<SuccessResponseType<{ isValid: boolean }> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        _id: userID,
      })) as SuccessResponseType<IUserStudentDocument>;

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

  async getProfile(
    idNumber?: string | undefined,
  ): Promise<SuccessResponseType<UserProfile> | ErrorResponseType> {
    try {
      if (!idNumber) {
        throw new ErrorResponse('BAD_REQUEST', 'ID Number us required.');
      }

      const user = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<UserProfile>;

      if (!user.success || !user.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      return {
        success: true,
        document: {
          first_name: user.document.first_name,
          last_name: user.document.last_name,
          middle_name: user.document.middle_name,
          suffix: user.document.suffix,
          gender: user.document.gender,
          date_of_birth: user.document.date_of_birth,
          address: user.document.address,
          contact_number: user.document.contact_number,
          facebook: user.document.facebook,
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

  async updatePassword(
    idNumber: string,
    newPassword: string,
  ): Promise<SuccessResponseType<IUserStudentDocument> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        idNumber: idNumber,
      })) as SuccessResponseType<IUserStudentDocument>;

      if (!response.success || !response.document) {
        throw response.error;
      }

      const hashedPassword = await bycrypt.hash(
        newPassword,
        config.bcrypt.saltRound,
      );

      const updateResponse = (await this.update(
        { idNumber: idNumber },
        { password: hashedPassword },
      )) as SuccessResponseType<IUserStudentDocument>;

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

export default new UserService();

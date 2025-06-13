import Mail from 'nodemailer/lib/mailer';
import {
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared/types';
import { ErrorResponse } from '../../../common/shared/utils';
import { config } from '../../../core/config';
import { IUserModel } from '../../users/models/mongoose';
import { UserService } from '../../users/services';
import MailServiceUtilities from '../../../common/shared/services/mail/mail.service.utility';
class AuthService {
  async register(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, idNumber } = payload;
      const userResponse = (await UserService.findOne({
        $or: [{ idNumber }, { email }],
      })) as SuccessResponseType<IUserModel>;

      if (userResponse.success || userResponse.document) {
        throw new ErrorResponse(
          'UNIQUE_FIELD_ERROR',
          'The entered email or id number is already registered.',
        );
      }

      const createUserRes = (await UserService.create(
        payload,
      )) as SuccessResponseType<IUserModel>;

      if (!createUserRes.success || !createUserRes.document) {
        throw createUserRes.error;
      }

      return {
        success: true,
        document: {
          user: createUserRes.document,
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

  /*
  async verifyAccount(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const {email, code } = payload;
      const userResponse = (await UserService.findOne({
        email
      })) as SuccessResponseType<IUserModel>

      if(!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      if (userResponse.document.verified) {
        return { success: true }; // If already verified, return success without further actions
      }
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
*/

  async login(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { idNumber, password } = payload;
      const userResponse = (await UserService.findOne({
        idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          'Invalid Credentials. ID number entered is not register',
        );
      }

      const user = userResponse.document;
      const isValidPasswordResponse = (await UserService.isValidPassword(
        user.id,
        password,
      )) as SuccessResponseType<{ isValid: boolean }>;
      if (
        !isValidPasswordResponse.success ||
        !isValidPasswordResponse.document?.isValid
      ) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid Credentials.');
      }

      return {
        success: true,
        document: {
          user,
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

  async forgotPassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email, idNumber } = payload;
      const userResponse = (await UserService.findOne(
        idNumber ? { idNumber } : { email }, // idk if this is good but u can use this instead : $or: [{ idNumber }, { email }],
      )) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const getEmail = userResponse.document.email;

      if (!getEmail) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User doesnt have email.');
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

  async resetPassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { idNumber, email, code, newPassword } = payload;

      const userResponse = (await UserService.findOne(
        idNumber ? { idNumber } : { email },
      )) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;
      const getEmail = user.email;

      if (!getEmail) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User doesnt have email.');
      }

      //TODO: check if verified

      //TODO: check if active

      //TODO: validate otp

      const updatePasswordResponse = await UserService.updatePassword(
        user.idNumber,
        newPassword,
      );

      if (!updatePasswordResponse.success) {
        throw updatePasswordResponse.error;
      }

      return { success: true };
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

export default new AuthService();

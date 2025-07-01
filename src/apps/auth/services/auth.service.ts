import {
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared/types';
import { ErrorResponse } from '../../../common/shared/utils';
import { config } from '../../../core/config';
import { IUserModel } from '../../users/models/mongoose';
import { UserService } from '../../users/services';
import { OTPService } from '.';
import {
  AsyncStorageService,
  JwtService,
  RedisService,
} from '../../../common/shared';
import { IOTPModel } from '../types';

class AuthService {
  async register(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, idNumber } = payload;

      const [idResponse, emailResponse] = (await Promise.all([
        UserService.findOne({ idNumber }),
        UserService.findOne({ email }),
      ])) as [SuccessResponseType<IUserModel>, SuccessResponseType<IUserModel>];

      const isExist = (() => {
        const id = idResponse.success || !!idResponse.document;
        const email = emailResponse.success || !!emailResponse.document;

        let message = '';
        if (id && email) message = 'id number and email';
        else if (id) message = 'id';
        else if (email) message = 'email';

        return { id, email, message };
      })();

      if (isExist.id || isExist.email) {
        throw new ErrorResponse(
          'UNIQUE_FIELD_ERROR',
          `The entered ${isExist.message} is already registered.`,
        );
      }

      const createUserRes = (await UserService.create(
        payload,
      )) as SuccessResponseType<IUserModel>;

      if (!createUserRes.success || !createUserRes.document) {
        throw createUserRes.error;
      }

      const otpResponse = (await OTPService.generate(
        email,
        config.otp.purposes.ACCOUNT_VERIFICATION.code,
      )) as SuccessResponseType<IOTPModel>;

      if (!otpResponse.success || !otpResponse.document) {
        throw otpResponse.error;
      }

      const { code, ...restOtp } = otpResponse.document.toObject();

      return {
        success: true,
        document: {
          user: createUserRes.document,
          otp: restOtp,
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

  async verifyAccount(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      if (userResponse.document.verified) {
        return { success: true }; // If already verified, return success without further actions
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.ACCOUNT_VERIFICATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const verifyUserResponse = await UserService.markAsVerified(email);

      if (!verifyUserResponse.success) {
        throw verifyUserResponse.error;
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
        user.idNumber,
        password,
      )) as SuccessResponseType<{ isValid: boolean }>;
      if (
        !isValidPasswordResponse.success ||
        !isValidPasswordResponse.document?.isValid
      ) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid Credentials.');
      }

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const refreshToken = await JwtService.signRefreshToken(
        user.idNumber,
        user.role,
      );
      const accessToken = await JwtService.signAccessToken(
        user.idNumber,
        user.role,
      );

      return {
        success: true,
        document: {
          token: { refreshToken, accessToken },
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
        idNumber ? { idNumber } : { email }, // idk if this is good but u can use this instead => $or: [{ idNumber }, { email }],
      )) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const getEmail = userResponse.document.email;

      if (!getEmail) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User doesnt have email.');
      }

      const user = userResponse.document;

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const otpResponse = await OTPService.generate(
        email,
        config.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
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

  async editProfile(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { idNumber, password, ...restPayload } = payload;
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

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const isValidPasswordResponse = (await UserService.isValidPassword(
        user.idNumber,
        password,
      )) as SuccessResponseType<{ isValid: boolean }>;
      if (
        !isValidPasswordResponse.success ||
        !isValidPasswordResponse.document?.isValid
      ) {
        throw new ErrorResponse('UNAUTHORIZED', 'Wrong password.');
      }

      const updateProfileResponse = (await UserService.updateProfile(
        user.idNumber,
        restPayload,
      )) as SuccessResponseType<IUserModel>;

      if (!updateProfileResponse.success) {
        throw updateProfileResponse.error;
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

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

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

  async logout(
    accessToken: string,
    refreshToken: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      if (!refreshToken || !accessToken) {
        throw new ErrorResponse(
          'BAD_REQUEST',
          'Refresh and access token are required.',
        );
      }

      const { idNumber: idNumberFromRefresh } =
        await JwtService.checkRefreshToken(refreshToken);
      const { idNumber: idNumberFromAccess } =
        await JwtService.checkAccessToken(accessToken);

      if (idNumberFromAccess !== idNumberFromRefresh) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          'Access token does not match refresh token.',
        );
      }

      // Blacklist the access token
      await RedisService.setBlacklistedInRedis(accessToken);

      // Remove the refresh token from Redis
      await RedisService.removeFromRedis(idNumberFromRefresh);

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

  async refresh(
    refreshToken: string,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      if (!refreshToken) {
        throw new ErrorResponse('BAD_REQUEST', 'Refresh token is required.');
      }

      const user = await JwtService.verifyRefreshToken(refreshToken);
      const { idNumber, role } = user;
      const accessToken = await JwtService.signAccessToken(idNumber, role);
      const newRefreshToken = await JwtService.signRefreshToken(idNumber, role);

      return {
        success: true,
        document: {
          token: {
            access: accessToken,
            refresh: newRefreshToken,
          },
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

export default new AuthService();

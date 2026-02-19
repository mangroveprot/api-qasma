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
import { eventBus, AuthEvents } from '../../../common/shared/events';
import { IOTPModel } from '../types';
import { Role } from '../../users';

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

      let existingUser: IUserModel | null = null;

      if (idResponse.success && idResponse.document) {
        existingUser = idResponse.document;
      } else if (emailResponse.success && emailResponse.document) {
        existingUser = emailResponse.document;
      }

      if (existingUser) {
        if (existingUser.verified) {
          const isExist = (() => {
            const id = idResponse.success || !!idResponse.document;
            const email = emailResponse.success || !!emailResponse.document;
            let message = '';
            if (id && email) message = 'id number and email';
            else if (id) message = 'id';
            else if (email) message = 'email';
            return { message };
          })();

          throw new ErrorResponse(
            'UNIQUE_FIELD_ERROR',
            `The entered ${isExist.message} is already registered.`,
          );
        } else {
          const updateUserRes = (await UserService.update(
            { idNumber: existingUser.idNumber },
            { ...payload },
          )) as SuccessResponseType<IUserModel>;

          if (!updateUserRes.success || !updateUserRes.document) {
            throw updateUserRes.error;
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
              user: updateUserRes.document,
              otp: restOtp,
            },
          };
        }
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
      const { email, code, purpose } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const purposeCode = config.otp.purposes[purpose]?.code;

      if (!purposeCode) {
        throw new ErrorResponse('INVALID_PURPOSE', 'Invalid OTP purpose.');
      }

      if (
        purpose === 'ACCOUNT_VERIFICATION' &&
        userResponse.document.verified
      ) {
        return { success: true };
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        purposeCode,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      if (
        purpose === 'ACCOUNT_VERIFICATION' &&
        !userResponse.document.verified
      ) {
        const verifyUserResponse = await UserService.markAsVerified(email);

        if (!verifyUserResponse.success) {
          throw verifyUserResponse.error;
        }
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
          'NOT_FOUND_ERROR',
          'This ID number is not registered.',
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
        throw new ErrorResponse('UNAUTHORIZED', 'Wrong password.');
      }

      if (!user.verified) {
        throw new ErrorResponse('FORBIDDEN', 'Unverified account.');
      }

      if (!user.active && user.role !== Role.Student) {
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

      eventBus.emit(AuthEvents.LOGIN_SUCCESS, { userId: user.idNumber });

      return {
        success: true,
        document: {
          token: { refreshToken, accessToken },
          user,
        },
      };
    } catch (error) {
      eventBus.emit(AuthEvents.LOGIN_FAILED, {
        identifier: payload?.idNumber ?? 'unknown',
        attemptNumber: 1,
      });
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
        getEmail,
        config.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      const { password, ...rest } = userResponse.document.toObject();

      eventBus.emit(AuthEvents.PASSWORD_RESET_REQUESTED, {
        userId: user.idNumber,
      });

      return {
        success: true,
        document: rest,
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
      const { idNumber, email, newPassword } = payload;

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

      const updatePasswordResponse = await UserService.updatePassword(
        user.idNumber,
        newPassword,
      );

      if (!updatePasswordResponse.success) {
        throw updatePasswordResponse.error;
      }

      eventBus.emit(AuthEvents.PASSWORD_CHANGE, { userId: user.idNumber });

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

  async changePassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { currentPassword, newPassword, idNumber } = payload;

      const userResponse = (await UserService.findOne({
        idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'This ID number is not register.',
        );
      }

      const user = userResponse.document;
      const isValidPasswordResponse = (await UserService.isValidPassword(
        user.idNumber,
        currentPassword,
      )) as SuccessResponseType<{ isValid: boolean }>;
      if (
        !isValidPasswordResponse.success ||
        !isValidPasswordResponse.document?.isValid
      ) {
        throw new ErrorResponse('FORBIDDEN', 'Wrong password.');
      }

      if (!user.verified) {
        throw new ErrorResponse('FORBIDDEN', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const updatePasswordResponse = await UserService.updatePassword(
        user.idNumber,
        newPassword,
      );

      if (!updatePasswordResponse.success) {
        throw updatePasswordResponse.error;
      }

      eventBus.emit(AuthEvents.PASSWORD_CHANGE, { userId: user.idNumber });

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

  async editProfile(
    idNumber: string,
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const userResponse = (await UserService.findOne({
        idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          'ID number entered is not register',
        );
      }

      const user = userResponse.document;

      const updateProfileResponse = (await UserService.updateProfile(
        user.idNumber,
        payload,
      )) as SuccessResponseType<IUserModel>;

      if (!updateProfileResponse.success) {
        throw updateProfileResponse.error;
      }

      const userObj = user.toObject ? user.toObject() : (user as any);
      const fieldsChanged = Object.keys(payload).filter(
        (k) =>
          userObj[k] !== payload[k] && !['password', 'fcmToken'].includes(k),
      );
      const oldValues: Record<string, any> = {};
      const newValues: Record<string, any> = {};
      fieldsChanged.forEach((k) => {
        oldValues[k] = userObj[k];
        newValues[k] = payload[k];
      });
      if (fieldsChanged.length > 0) {
        eventBus.emit(AuthEvents.PROFILE_UPDATED, {
          userId: user.idNumber,
          fieldsChanged,
          oldValues,
          newValues,
        });
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
    idNumber: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      if (!refreshToken || !accessToken) {
        throw new ErrorResponse(
          'BAD_REQUEST',
          'Refresh and access token are required.',
        );
      }

      const { idNumber: idNumberFromRefresh } =
        await JwtService.decodeRefreshToken(refreshToken);
      const { idNumber: idNumberFromAccess } =
        await JwtService.decodeAccessToken(accessToken);

      if (idNumberFromAccess !== idNumberFromRefresh) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          'Access token does not match refresh token.',
        );
      }

      await RedisService.setBlacklistedInRedis(accessToken).catch(() => {});

      await RedisService.removeFromRedis(idNumberFromRefresh).catch(() => {});

      await UserService.updateFcmToken(idNumber, '');

      eventBus.emit(AuthEvents.LOGOUT, { userId: idNumberFromRefresh });

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

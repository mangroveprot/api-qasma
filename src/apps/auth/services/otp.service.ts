import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared';
import MailServiceUtilities from '../../../common/shared/services/mail/mail.service.utility';
import { config } from '../../../core/config';
import { BaseService } from '../../../core/engine';
import { getDateTime } from '../../../helpers';
import { generateRandomOTP } from '../../../helpers/generateRandomOTP';
import { IUserModel, UserService } from '../../users';
import { OTPModel } from '../models';
import { OTPRepository } from '../repositories';
import { IOTPModel, TOTPPurpose } from '../types';

class OTPService extends BaseService<IOTPModel, OTPRepository> {
  constructor() {
    const otpRepo = new OTPRepository(OTPModel);
    super(otpRepo);
  }

  async generate(
    email: string,
    purpose: TOTPPurpose,
  ): Promise<SuccessResponseType<IOTPModel> | ErrorResponseType> {
    try {
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;
      await this.repository.invalidateOldCodes(user.idNumber, purpose);
      const otp = await this.repository.create({
        code: generateRandomOTP(config.otp.length),
        expiresAt: new Date(getDateTime.toString() + config.otp.expiration),
        idNumber: user.idNumber,
        purpose,
      });
      const mailResponse = await MailServiceUtilities.sendOtpWithTemplate({
        to: user.email,
        code: otp.code,
        purpose,
        firstName: user.first_name,
        lastName: user.last_name,
      });

      if (!mailResponse.success) {
        throw mailResponse.error;
      }

      return { success: true, document: otp };
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

  async validate(
    email: string,
    code: string,
    purpose: TOTPPurpose,
  ): Promise<SuccessResponseType<IOTPModel> | ErrorResponseType> {
    try {
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;
      const otpResponse = await this.repository.findValidCodeByUser(
        code,
        user.idNumber,
        purpose,
      );

      const invalidOtpError = new ErrorResponse(
        'UNAUTHORIZED',
        'This OTP code is invalid or has expired.',
      );

      if (!otpResponse) {
        throw invalidOtpError;
      }

      const otp = otpResponse;
      if (await this.repository.isExpired(otp)) {
        throw invalidOtpError;
      }

      await this.repository.markAsUsed(otp.id);

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

export default new OTPService();

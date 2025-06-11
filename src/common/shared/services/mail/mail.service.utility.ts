import { MailService } from './index';
import { ErrorResponse, ErrorResponseType, SuccessResponseType } from '../..';
import { config } from '../../../../core/config';
import mailService from './mail.service';

class MailServiceUtilities {
  static async sendOtp({
    to,
    code,
    purpose,
  }: {
    to: string;
    code: string;
    purpose: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    const otpPurpose = config.otp.purposes[purpose];
    if (!otpPurpose) {
      return {
        success: false,
        error: new ErrorResponse('BAD_REQUEST', 'Invalid OTP purpose provided'),
      };
    }

    const subject = otpPurpose.title;
    const text = `${otpPurpose.message} ${code}\n\nThis code is valid for ${
      config.otp.expiration / 60000
    } minutes.`;
    return await MailService.sendMail({ to, subject, text });
  }
  static async sendOtpWithTemplate({
    to,
    code,
    purpose,
    firstName,
    lastName,
  }: {
    to: string;
    code: string;
    purpose: string;
    firstName: string;
    lastName: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    const otpPurpose = config.otp.purposes[purpose];
    if (!otpPurpose) {
      return {
        success: false,
        error: new ErrorResponse('BAD_REQUEST', 'Invalid OTP purpose provided'),
      };
    }
    const subject = otpPurpose.title;
    const title = otpPurpose.title;
    const fullName = `${firstName} ${lastName}`;
    const otpCode = code.toString();
    const validTime = config.otp.expiration / 60000;
    const templateData = {
      title: title,
      fullName: fullName,
      otpCode: otpCode,
      validTime: validTime,
    };
    const htmlTemplate = 'otp-verification';

    return await MailService.sendMail({
      to,
      subject,
      htmlTemplate,
      templateData,
    });
  }
}

export default MailServiceUtilities;

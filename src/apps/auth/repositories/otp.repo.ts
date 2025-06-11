import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/engine';
import { IOTPModel, TOTPPurpose } from '../types';
import { generateRandomOTP } from '../../../helpers/generateRandomOTP';
import { config } from '../../../core/config';

class OTPRepository extends BaseRepository<IOTPModel> {
  constructor(model: Model<IOTPModel>) {
    super(model);
  }

  async generateCode(
    idNumber: string,
    purpose: TOTPPurpose,
  ): Promise<IOTPModel> {
    await this.invalidateOldCodes(idNumber, purpose);
    const otp = new this.model({
      code: generateRandomOTP(config.otp.length),
      expiresAt: new Date(Date.now() + config.otp.expiration),
      idNumber,
      purpose,
    });

    return await otp.save();
  }

  async markAsUsed(otpId: string): Promise<IOTPModel | null> {
    return await this.model
      .findByIdAndUpdate(otpId, { used: true }, { new: true })
      .exec();
  }

  async isExpired(otp: IOTPModel): Promise<boolean> {
    return otp.expiresAt ? Date.now() > otp.expiresAt.getTime() : true;
  }

  async isValid(code: string): Promise<boolean> {
    const otp = await this.findOne({ code, isFresh: true, used: false });
    return otp ? Date.now() <= otp.expiresAt.getTime() : false;
  }

  async findValidCodeByUser(
    code: string,
    idNumber: string,
    purpose: TOTPPurpose,
  ): Promise<IOTPModel | null> {
    return await this.findOne({
      code,
      idNumber,
      isFresh: true,
      used: false,
      purpose,
    });
  }

  async invalidateOldCodes(
    idNumber: string,
    purpose: TOTPPurpose,
  ): Promise<void> {
    await this.model
      .updateMany(
        { idNumber, used: false, purpose },
        { $set: { isFresh: false } },
      )
      .exec();
  }
}

export default OTPRepository;

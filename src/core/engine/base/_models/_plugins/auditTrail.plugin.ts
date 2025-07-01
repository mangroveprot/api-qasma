import { Schema } from 'mongoose';
import moment from 'moment-timezone';
import {
  AsyncStorageService,
  logger,
} from '../../../../../common/shared/services';
import { config } from '../../../../config';

const auditTrailPlugin = (schema: Schema) => {
  schema.pre('save', function (next) {
    const currentUser = AsyncStorageService.getInstance().get('currentUser');

    if (!currentUser) {
      logger.warn(
        'Warning: currentUser is undefined. Audit trail field will not be set.',
      );
    }

    if (this.isNew || this.isModified()) {
      this.set(
        'createdBy',
        (config.runningProd ? currentUser.idNumber : 'unknown') || null,
      );
      logger.info(
        'Warning: currentUser is undefined. Audit trail field will not be set.',
      );
    } else {
      this.set(
        'updatedBy',
        (config.runningProd ? currentUser.idNumber : 'unknown') || null,
      );
      logger.info(
        'Warning: currentUser is undefined. Audit trail field will not be set.',
      );
    }
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    const currentUser = AsyncStorageService.getInstance().get('currentUser');
    if (!currentUser) {
      logger.warn(
        'Warning: currentUser is undefined. Audit trail fields will not be set.',
      );
    }

    this.set(
      'updatedBy',
      (config.runningProd ? currentUser.idNumber : 'unknown') || null,
    );
    next();
  });

  schema.methods.softDelete = function () {
    const currentUser = AsyncStorageService.getInstance().get('currentUser');
    this.deletedAt = moment.tz(config.timeZone).toDate();
    this.deletedBy = currentUser.idNumber || null;
    return this.save();
  };
};

export default auditTrailPlugin;

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
      const idNumber = currentUser?.idNumber;

      if (idNumber) {
        this.set('createdBy', idNumber);
      } else {
        this.set('createdBy', 'unknown');
        logger.info(
          'Warning: currentUser is undefined or missing idNumber. Audit trail field set to "unknown".',
        );
      }
    }
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    const currentUser = AsyncStorageService.getInstance().get('currentUser');

    const idNumber = currentUser?.idNumber;

    if (idNumber) {
      this.set('updatedBy', idNumber);
    } else {
      this.set('updatedBy', 'unknown');
      logger.info(
        'Warning: currentUser is undefined or missing idNumber. Audit trail field set to "unknown".',
      );
    }
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

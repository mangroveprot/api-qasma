import { Schema } from 'mongoose';
import moment from 'moment-timezone';
import {
  AsyncStorageService,
  logger,
} from '../../../../../common/shared/services';
import { config } from '../../../../config';

const auditTrailPlugin = (schema: Schema) => {
  schema.pre('save', function (next) {
    const currentUserId =
      AsyncStorageService.getInstance().get('currentUserId');

    if (!currentUserId) {
      logger.warn(
        'Warning: currentUserId is undefined. Audit trail field will not be set.',
      );
    }

    if (this.isNew || this.isModified()) {
      this.set('createdBy', currentUserId.idNumber || null);
      logger.info(
        'Warning: currentUserId is undefined. Audit trail field will not be set.',
      );
    } else {
      this.set('updatedBy', currentUserId.idNumber || null);
      logger.info(
        'Warning: currentUserId is undefined. Audit trail field will not be set.',
      );
    }
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    const currentUserId =
      AsyncStorageService.getInstance().get('currentUserId');
    if (!currentUserId) {
      logger.warn(
        'Warning: currentUserId is undefined. Audit trail fields will not be set.',
      );
    }

    this.set('updatedBy', currentUserId.idNumber || null);
    next();
  });

  schema.methods.softDelete = function () {
    const currentUserId =
      AsyncStorageService.getInstance().get('currentUserId');
    this.deletedAt = moment.tz(config.timeZone).toDate();
    this.deletedBy = currentUserId || null;
    return this.save();
  };
};

export default auditTrailPlugin;

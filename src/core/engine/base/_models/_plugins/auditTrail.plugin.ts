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

    if (this.isNew) {
      this.set('createdBy', currentUserId || null);
    } else {
      this.set('updatedBy', currentUserId || null);
    }
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

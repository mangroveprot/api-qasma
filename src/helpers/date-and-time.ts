import moment from 'moment-timezone';
import { config } from '../core/config';

export const getDateTime = moment.tz(config.timeZone).toDate();

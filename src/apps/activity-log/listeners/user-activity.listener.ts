import { eventBus, UserEvents } from '../../../common/shared/events';
import type { UserFcmTokenUpdatedPayload } from '../../../common/shared/events';
import ActivityLogService from '../services/activityLog.service';

export function registerUserActivityListeners(): void {
  // eventBus.on(
  //   UserEvents.FCM_TOKEN_UPDATED,
  //   (payload: UserFcmTokenUpdatedPayload) => {
  //     void ActivityLogService.logSystemAction(
  //       payload.userId,
  //       'fcm_token_updated',
  //       { channel: payload.channel },
  //       {},
  //     );
  //   },
  // );
}

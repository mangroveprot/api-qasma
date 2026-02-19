import { eventBus, UserEvents } from '../../../common/shared/events';
import type { UserFcmTokenUpdatedPayload } from '../../../common/shared/events';
import ActivityLogService from '../services/activityLog.service';

/**
 * Subscribes to user domain events and writes to the activity log.
 *
 * UserService only emits events (e.g. user:fcm_token_updated). This listener
 * turns them into log entries—so the user service doesn't depend on
 * ActivityLogService.
 */
export function registerUserActivityListeners(): void {
  eventBus.on(
    UserEvents.FCM_TOKEN_UPDATED,
    (payload: UserFcmTokenUpdatedPayload) => {
      void ActivityLogService.logSystemAction(
        payload.userId,
        'fcm_token_updated',
        { channel: payload.channel },
        {},
      );
    },
  );
}

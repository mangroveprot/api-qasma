import { eventBus, AuthEvents } from '../../../common/shared/events';
import type {
  AuthLoginSuccessPayload,
  AuthLoginFailedPayload,
  AuthLogoutPayload,
  AuthPasswordChangePayload,
  AuthPasswordResetRequestedPayload,
  AuthProfileUpdatedPayload,
} from '../../../common/shared/events';
import ActivityLogService from '../services/activityLog.service';

export function registerAuthActivityListeners(): void {
  eventBus.on(AuthEvents.LOGIN_SUCCESS, (payload: AuthLoginSuccessPayload) => {
    void ActivityLogService.logLogin(payload.userId, true, {});
  });

  eventBus.on(AuthEvents.LOGIN_FAILED, (payload: AuthLoginFailedPayload) => {
    void ActivityLogService.logFailedLogin(
      payload.identifier,
      payload.attemptNumber,
      {},
    );
  });

  eventBus.on(AuthEvents.LOGOUT, (payload: AuthLogoutPayload) => {
    void ActivityLogService.logSystemAction(payload.userId, 'logout', {}, {});
  });

  eventBus.on(
    AuthEvents.PASSWORD_CHANGE,
    (payload: AuthPasswordChangePayload) => {
      void ActivityLogService.logPasswordChange(payload.userId, {});
    },
  );

  eventBus.on(
    AuthEvents.PASSWORD_RESET_REQUESTED,
    (payload: AuthPasswordResetRequestedPayload) => {
      void ActivityLogService.logSystemAction(
        payload.userId,
        'password_reset_requested',
        {},
        {},
      );
    },
  );

  eventBus.on(
    AuthEvents.PROFILE_UPDATED,
    (payload: AuthProfileUpdatedPayload) => {
      void ActivityLogService.logProfileUpdate(
        payload.userId,
        {
          fieldsChanged: payload.fieldsChanged,
          oldValues: payload.oldValues,
          newValues: payload.newValues,
        },
        {},
      );
    },
  );
}

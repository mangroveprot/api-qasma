/**
 * Auth domain events.
 *
 * AuthService emits these when something happens (login, logout, password
 * change, etc.). The activity-log listener subscribes and writes to the log—
 * so AuthService never imports ActivityLogService.
 */
export const AuthEvents = {
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILED: 'auth:login:failed',
  LOGOUT: 'auth:logout',
  PASSWORD_CHANGE: 'auth:password:changed',
  PASSWORD_RESET_REQUESTED: 'auth:password:reset:requested',
  PROFILE_UPDATED: 'auth:profile:updated',
} as const;

export type AuthLoginSuccessPayload = { userId: string };
export type AuthLoginFailedPayload = { identifier: string; attemptNumber: number };
export type AuthLogoutPayload = { userId: string };
export type AuthPasswordChangePayload = { userId: string };
export type AuthPasswordResetRequestedPayload = { userId: string };
export type AuthProfileUpdatedPayload = {
  userId: string;
  fieldsChanged: string[];
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
};

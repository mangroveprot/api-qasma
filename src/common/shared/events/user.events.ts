/**
 * User domain events.
 *
 * When user-related actions happen (e.g. FCM token updated), the user service
 * emits these events. The activity-log listener writes them—keeping the user
 * service free of logging code.
 */
export const UserEvents = {
  FCM_TOKEN_UPDATED: 'user:fcm_token_updated',
} as const;

export type UserFcmTokenUpdatedPayload = {
  userId: string;
  channel: string;
};

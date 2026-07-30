export const UserEvents = {
  FCM_TOKEN_UPDATED: 'user:fcm_token_updated',
} as const;

export type UserFcmTokenUpdatedPayload = {
  userId: string;
  channel: string;
};

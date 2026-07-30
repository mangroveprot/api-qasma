import * as admin from 'firebase-admin';
import { config } from '../../../core/config';

let firebaseApp: admin.app.App | null = null;

function init(): void {
  try {
    if (admin.apps.length > 0) {
      firebaseApp = admin.apps[0];
      console.info('Firebase Admin already initialized');
      return;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
      }),
    });

    console.info('Firebase Admin initialized successfully');
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to initialize Firebase Admin:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    firebaseApp = null;
  }
}

function getApp(): admin.app.App {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized. Call init() first.');
  }
  return firebaseApp;
}

class FCMService {
  private ensureInitialized(): void {
    if (!firebaseApp) {
      init();
    }
    if (!firebaseApp) {
      throw new Error(
        'Firebase Admin not initialized. Please check your Firebase configuration.',
      );
    }
  }

  async sendNotification({
    token,
    title,
    body,
    data = {},
  }: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      this.ensureInitialized();
      const app = getApp();

      const stringifiedData: Record<string, string> = {};
      for (const key in data) {
        stringifiedData[key] =
          typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
      }

      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: stringifiedData,
        token,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'appointment_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const messageId = await admin.messaging(app).send(message);

      console.info(`Notification sent successfully: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to send notification:', err.message);
      if (err.stack) {
        console.error(err.stack);
      }

      return {
        success: false,
        error: err.message || 'Unknown error',
      };
    }
  }

  async sendMultipleNotifications(
    notifications: Array<{
      token: string;
      title: string;
      body: string;
      data?: Record<string, string>;
    }>,
  ): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
    const results = await Promise.all(
      notifications.map((notification) => this.sendNotification(notification)),
    );
    return results;
  }
}

export default new FCMService();

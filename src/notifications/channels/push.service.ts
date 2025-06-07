import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../entities/notification.entity';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly firebaseApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
    });
  }

  async send(notification: Notification, data: Record<string, any>): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        token: data.fcmToken,
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          type: notification.type,
          ...notification.metadata,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
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

      const response = await this.firebaseApp.messaging().send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<void> {
    try {
      await this.firebaseApp.messaging().subscribeToTopic(token, topic);
      this.logger.log(`Token ${token} subscribed to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic: ${error.message}`, error.stack);
      throw error;
    }
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<void> {
    try {
      await this.firebaseApp.messaging().unsubscribeFromTopic(token, topic);
      this.logger.log(`Token ${token} unsubscribed from topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendToTopic(topic: string, notification: Notification): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          type: notification.type,
          ...notification.metadata,
        },
      };

      const response = await this.firebaseApp.messaging().send(message);
      this.logger.log(`Topic notification sent successfully: ${response}`);
    } catch (error) {
      this.logger.error(`Failed to send topic notification: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
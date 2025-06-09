import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification, NotificationPreference, NotificationTemplate } from './entities/notification.entity';
import { NotificationChannel, NotificationStatus, NotificationType } from './enums/notification.enum';
import { EmailService } from './channels/email.service';
import { InAppService } from './channels/in-app.service';
import { PushService } from './channels/push.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly templates: Map<string, NotificationTemplate> = new Map();
  private readonly preferences: Map<string, NotificationPreference> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly inAppService: InAppService,
    private readonly pushService: PushService,
  ) {
    this.initializeTemplates();
  }

  private async initializeTemplates() {
    // Initialize default templates
    const defaultTemplates = [
      {
        id: 'gas-price-alert',
        type: NotificationType.GAS_PRICE_ALERT,
        channel: NotificationChannel.EMAIL,
        subject: 'Gas Price Alert',
        title: 'Gas Price Update',
        body: 'The current gas price is {{price}} Gwei',
        variables: ['price'],
      },
      // Add more templates as needed
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
    channels: NotificationChannel[] = [NotificationChannel.IN_APP],
  ): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      type,
      title: '',
      message: '',
      channel: channels[0],
      status: NotificationStatus.PENDING,
      metadata: data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const preferences = await this.getUserPreferences(userId);
      const template = this.getTemplate(type, channels[0]);

      // Apply template
      notification.title = this.interpolateTemplate(template.title, data);
      notification.message = this.interpolateTemplate(template.body, data);

      // Send through each channel
      for (const channel of channels) {
        if (this.shouldSendNotification(preferences, type, channel)) {
          await this.sendThroughChannel(notification, channel, data);
        }
      }

      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      notification.status = NotificationStatus.FAILED;
      notification.error = error.message;
    }

    return notification;
  }

  async scheduleNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
    scheduledFor: Date,
    channels: NotificationChannel[] = [NotificationChannel.IN_APP],
  ): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      type,
      title: '',
      message: '',
      channel: channels[0],
      status: NotificationStatus.SCHEDULED,
      metadata: data,
      scheduledFor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store scheduled notification
    // In a real implementation, you would store this in a database
    return notification;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications() {
    const now = new Date();
    // In a real implementation, you would query the database for scheduled notifications
    const scheduledNotifications = []; // Get from database

    for (const notification of scheduledNotifications) {
      if (notification.scheduledFor <= now) {
        await this.sendNotification(
          notification.userId,
          notification.type,
          notification.metadata,
          [notification.channel],
        );
      }
    }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    const currentPreferences = await this.getUserPreferences(userId);
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
      updatedAt: new Date(),
    };

    this.preferences.set(userId, updatedPreferences);
    return updatedPreferences;
  }

  private async getUserPreferences(userId: string): Promise<NotificationPreference> {
    if (!this.preferences.has(userId)) {
      // Set default preferences
      this.preferences.set(userId, {
        userId,
        email: true,
        inApp: true,
        push: false,
        types: Object.values(NotificationType).reduce((acc, type) => {
          acc[type] = { email: true, inApp: true, push: false };
          return acc;
        }, {}),
        updatedAt: new Date(),
      });
    }
    return this.preferences.get(userId);
  }

  private getTemplate(type: NotificationType, channel: NotificationChannel): NotificationTemplate {
    const templateId = `${type.toLowerCase()}-${channel.toLowerCase()}`;
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found for type ${type} and channel ${channel}`);
    }
    return template;
  }

  private interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  private shouldSendNotification(
    preferences: NotificationPreference,
    type: NotificationType,
    channel: NotificationChannel,
  ): boolean {
    return preferences[channel.toLowerCase()] && preferences.types[type][channel.toLowerCase()];
  }

  private async sendThroughChannel(
    notification: Notification,
    channel: NotificationChannel,
    data: Record<string, any>,
  ): Promise<void> {
    switch (channel) {
      case NotificationChannel.EMAIL:
        await this.emailService.send(notification, data);
        break;
      case NotificationChannel.IN_APP:
        await this.inAppService.send(notification, data);
        break;
      case NotificationChannel.PUSH:
        await this.pushService.send(notification, data);
        break;
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }
} 
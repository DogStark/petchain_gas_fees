import { NotificationChannel, NotificationStatus, NotificationType } from '../enums/notification.enum';

export class Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  error?: string;
}

export class NotificationPreference {
  userId: string;
  email: boolean;
  inApp: boolean;
  push: boolean;
  types: {
    [key in NotificationType]: {
      email: boolean;
      inApp: boolean;
      push: boolean;
    };
  };
  updatedAt: Date;
}

export class NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  title: string;
  body: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
} 
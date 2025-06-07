import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class InAppService {
  private readonly logger = new Logger(InAppService.name);
  private readonly userSockets: Map<string, string[]> = new Map();

  @WebSocketServer()
  server: Server;

  async send(notification: Notification, data: Record<string, any>): Promise<void> {
    try {
      const userSockets = this.userSockets.get(notification.userId) || [];
      
      if (userSockets.length === 0) {
        this.logger.warn(`No active sockets found for user ${notification.userId}`);
        return;
      }

      const notificationData = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        timestamp: new Date(),
      };

      // Send to all user's connected sockets
      userSockets.forEach(socketId => {
        this.server.to(socketId).emit('notification', notificationData);
      });

      this.logger.log(`In-app notification sent to user ${notification.userId}`);
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  handleConnection(socket: any): void {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    const userSockets = this.userSockets.get(userId) || [];
    userSockets.push(socket.id);
    this.userSockets.set(userId, userSockets);

    this.logger.log(`User ${userId} connected with socket ${socket.id}`);
  }

  handleDisconnect(socket: any): void {
    const userId = socket.handshake.auth.userId;
    if (!userId) return;

    const userSockets = this.userSockets.get(userId) || [];
    const updatedSockets = userSockets.filter(id => id !== socket.id);
    
    if (updatedSockets.length === 0) {
      this.userSockets.delete(userId);
    } else {
      this.userSockets.set(userId, updatedSockets);
    }

    this.logger.log(`User ${userId} disconnected socket ${socket.id}`);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // In a real implementation, you would update the notification status in the database
    this.logger.log(`Notification ${notificationId} marked as read by user ${userId}`);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    // In a real implementation, you would fetch unread notifications from the database
    return [];
  }
} 
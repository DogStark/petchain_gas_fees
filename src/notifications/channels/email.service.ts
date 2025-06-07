import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../entities/notification.entity';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE', true),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async send(notification: Notification, data: Record<string, any>): Promise<void> {
    try {
      const template = await this.getEmailTemplate(notification.type);
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate(data);

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: data.email,
        subject: notification.title,
        html,
      });

      this.logger.log(`Email sent successfully to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getEmailTemplate(type: string): Promise<string> {
    // In a real implementation, you would load templates from a database or file system
    const templates = {
      [NotificationType.GAS_PRICE_ALERT]: `
        <h1>Gas Price Alert</h1>
        <p>The current gas price is {{price}} Gwei</p>
        <p>Network: {{network}}</p>
        <p>Time: {{timestamp}}</p>
      `,
      [NotificationType.PET_BREED_UPDATE]: `
        <h1>Pet Breed Update</h1>
        <p>Your pet {{petName}} has been classified as {{breed}}</p>
        <p>Confidence: {{confidence}}%</p>
      `,
      // Add more templates as needed
    };

    return templates[type] || templates[NotificationType.SYSTEM_UPDATE];
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from './notification-strategy.interface';
import { Notification } from '../entities/notification.entity';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailStrategy implements NotificationStrategy {
  private readonly logger = new Logger(EmailStrategy.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async send(notification: Notification): Promise<boolean> {
    try {
      const preference = await notification.user.notificationPreferences.find(
        (pref) => pref.notificationType === notification.type
      );

      if (!preference?.channelConfig?.email?.address) {
        throw new Error('Email address not configured');
      }

      const { address } = preference.channelConfig.email;

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: address,
        subject: `${notification.type} Notification`,
        html: this.generateEmailTemplate(notification),
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`, error.stack);
      return false;
    }
  }

  private generateEmailTemplate(notification: Notification): string {
    // This is a basic template. You can enhance it with a proper HTML template engine
    return `
      <h2>${notification.type}</h2>
      <p>Time: ${notification.createdAt.toLocaleString()}</p>
      <div>
        ${JSON.stringify(notification.content, null, 2)}
      </div>
    `;
  }
} 
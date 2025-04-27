import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailProvider } from '../providers/mail-provider.service';

@Processor('email-queue')
export class EmailProcessor {
  constructor(private readonly mailProvider: MailProvider) {}

  @Process('send-welcome-email')
  async handleWelcomeEmail(job: Job<{ email: string; name: string }>) {
    try {
      await this.mailProvider.WelcomeEmail({
        username: job.data.name,
        email: job.data.email
      });
    } catch (error) {
      console.error('Email failed:', error);
      throw error;
    }
  }
}

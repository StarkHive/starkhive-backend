import { forwardRef, Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailProvider } from './providers/mail-provider.service';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processor/email.processor';
import { UserModule } from '@src/user/user.module';

@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    BullModule.forRoot({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
      BullModule.registerQueue({
        name: 'email-queue',
      }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          secure: false,
          port: config.get('MAIL_PORT'),
          auth: {
            user: config.get('SMTP_USERNAME'),
            pass: config.get('SMTP_PASSWORD'),
          },
          default: {
            from: `no-reply-<helpdesk@realTimeChat>`,
          },
          template: {
            dir: join(__dirname, 'template'),
            adapter: new EjsAdapter({
              inlineCssEnabled: true,
            }),
            Option: {
              strict: false,
            },
          },
          subject: `welcome to StarkHive`
        },
      }),
    }),
  ],
  providers: [MailProvider, MailProvider, EmailProcessor],
  exports: [MailProvider, EmailProcessor],
})
export class MailModule {}
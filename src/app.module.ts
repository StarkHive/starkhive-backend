import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingsModule } from './job-postings/job-postings.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { RolesGuard } from './auth/guards/roles.guard';
import { PermissionService } from './auth/services/permission.service';
import { PermissionGuard } from './auth/guards/permissions.guard';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import * as dotenv from 'dotenv';
import { ContractModule } from './contract/contract.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { FreelancerProfileModule } from './freelancer-profile/freelancer-profile.module';
import { PostModule } from './post/post.module';
import { ApiUsageMiddleware } from './auth/middleware/api-usage.middleware';
import { AuditModule } from './audit/audit.module';
import { ContentModule } from './content/content.module';
import { ReportingModule } from './reporting/reporting.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ConfigurationModule } from './configuration/configuraton.module';
import { HealthModule } from './health/health.module';
dotenv.config();

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.development',
        '.env.production',
        '.env.test',
        '.env.local',
      ],
    }),

    // Configure TypeORM with environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        autoLoadEntities: true,
      }),
    }),

    // Import modules
    AuthModule,
    JobPostingsModule,
    CompanyModule,
    UserModule,
    ContractModule,
    PaymentModule,
    NotificationsModule,
    NotificationSettingsModule,
    FreelancerProfileModule,
    PostModule,
    AuditModule,
    ConfigurationModule,
    ContentModule,
    ReportingModule,
    AnalyticsModule,
    HealthModule,
  ],
  providers: [RolesGuard, PermissionGuard, PermissionService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware,ApiUsageMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

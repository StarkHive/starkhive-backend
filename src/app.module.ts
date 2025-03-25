/* eslint-disable prettier/prettier */
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingsModule } from './job-postings/job-postings.module';
import { JobPosting } from './job-postings/entities/job-posting.entity';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { RolesGuard } from './auth/guards/roles.guard';
import { PermissionService } from './auth/services/permission.service';
import { PermissionGuard } from './auth/guards/permissions.guard';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import * as dotenv from 'dotenv';
import { ContractModule } from './contract/contract.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { FreelancerProfileModule } from './freelancer-profile/freelancer-profile.module';
import { PostService } from './post/post.service';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { SearchModule } from './search/search.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { PostModule } from './post/post.module';
// import { ReportModule } from './report/report.module';
import { ReportsModule } from './reports/reports.module';
import { EndorsementModule } from './endorsement/endorsement.module';
// import { NotificationsService } from './notifications/notifications.service';
import { PolicyModule } from './policy/policy.module';
import { PolicyReportingModule } from './policy-reporting/policy-reporting.module';
import { PolicyVersionModule } from './policy-version/policy-version.module';
import { PolicyViolationModule } from './policy-violation/policy-violation.module';
import { UserConsent } from './user-censent/user-censent.entity';
import { ApiUsageMiddleware } from './auth/middleware/api-usage.middleware';
import { AuditModule } from './audit/audit.module';
import { ContentModule } from './content/content.module';
import { ReportingModule } from './reporting/reporting.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ConfigurationModule } from './configuration/configuraton.module';
import { HealthModule } from './health/health.module';
import { ConnectionModule } from './connection/connection.module';
import { ProjectModule } from './project/project.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { SearchModule } from './search/search.module';
import { CommentModule } from './comment/comment.module';
import { MessagingModule } from './messaging/messaging.module';
import { ErrorTrackingModule } from './error-tracking/error-tracking.module';
import { ErrorTrackingMiddleware } from './error-tracking/middleware/error-tracking.middleware';
import { ReputationModule } from './reputation/reputation.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { SkillsModule } from './skills/skills.module';
dotenv.config();

@Module({
    imports: [
        // Load environment variables globally
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.development', '.env.production', '.env.test'],
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
     ConversationsModule,
    JobPostingsModule,
    CompanyModule,
    UserModule,
    ContractModule,
    PaymentModule,
    NotificationsModule,
    NotificationSettingsModule,
    FreelancerProfileModule,
    PostModule,
    ReportsModule,
    EndorsementModule,
    PolicyModule,
    PolicyReportingModule,
    PolicyVersionModule,
    PolicyViolationModule,
    UserConsent,
    AuditModule,
    ConfigurationModule,
    ContentModule,
    ReportingModule,
    AnalyticsModule,
    HealthModule,
    ConnectionModule,
    ProjectModule,
    TimeTrackingModule,
    SearchModule,
    CommentModule,
    MessagingModule
    ErrorTrackingModule,
   AttachmentsModule,
      WebsocketsModule,
    ReputationModule,
    BlockchainModule,
    ErrorTrackingModule,
    SkillsModule

  ],
  providers: [
    RolesGuard,
    PermissionGuard,
    PermissionService,
    PostService,
    // NotificationsService,
  ],
  // exports: [NotificationsService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply error tracking middleware first to catch all errors
    consumer
      .apply(ErrorTrackingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // Apply other middleware
    consumer
      .apply(AuthMiddleware, ApiUsageMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}


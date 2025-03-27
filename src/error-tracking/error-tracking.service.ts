import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLog, ErrorSeverity } from './entities/error-log.entity';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Injectable()
export class ErrorTrackingService implements OnModuleInit {
  private emailTransport;

  constructor(
    @InjectRepository(ErrorLog)
    private errorLogRepository: Repository<ErrorLog>,
    private configService: ConfigService,
  ) {
    this.emailTransport = createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  onModuleInit() {
    // Initialize Sentry
    Sentry.init({
      dsn: this.configService.get('SENTRY_DSN'),
      environment: this.configService.get('NODE_ENV'),
      tracesSampleRate: 1.0,
    });
  }

  async logError(error: Error, request: any, severity: ErrorSeverity = ErrorSeverity.MEDIUM) {
    // Create error log entry
    const errorLog = this.errorLogRepository.create({
      message: error.message,
      stackTrace: error.stack,
      errorCode: error.name,
      severity,
      path: request.path,
      method: request.method,
      userId: request.user?.id,
      metadata: {
        headers: request.headers,
        query: request.query,
        body: this.sanitizeRequestBody(request.body),
      },
    });

    // Save to database
    await this.errorLogRepository.save(errorLog);

    // Send to Sentry
    Sentry.captureException(error, {
      level: this.mapSeverityToSentryLevel(severity),
      user: { id: request.user?.id },
      extra: errorLog.metadata,
    });

    // Send alert for critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      await this.sendCriticalErrorAlert(errorLog);
    }

    return errorLog;
  }

  async getErrorLogs(filters: {
    severity?: ErrorSeverity;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const query = this.errorLogRepository.createQueryBuilder('error_log');

    if (filters.severity) {
      query.andWhere('error_log.severity = :severity', { severity: filters.severity });
    }

    if (filters.startDate) {
      query.andWhere('error_log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('error_log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.userId) {
      query.andWhere('error_log.userId = :userId', { userId: filters.userId });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    query.orderBy('error_log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [errors, total] = await query.getManyAndCount();

    return {
      errors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async sendCriticalErrorAlert(errorLog: ErrorLog) {
    const alertEmails = this.configService.get('ERROR_ALERT_EMAILS')?.split(',') || [];
    if (alertEmails.length === 0) return;

    const emailContent = `
      Critical Error Detected!
      
      Message: ${errorLog.message}
      Path: ${errorLog.path}
      Method: ${errorLog.method}
      Time: ${errorLog.createdAt}
      Error Code: ${errorLog.errorCode}
      User ID: ${errorLog.userId || 'Not authenticated'}
      
      Stack Trace:
      ${errorLog.stackTrace}
      
      Metadata:
      ${JSON.stringify(errorLog.metadata, null, 2)}
    `;

    await this.emailTransport.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to: alertEmails,
      subject: `[CRITICAL ERROR] ${errorLog.message}`,
      text: emailContent,
    });
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private mapSeverityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
    const mapping: Record<ErrorSeverity, Sentry.SeverityLevel> = {
      [ErrorSeverity.LOW]: 'debug',
      [ErrorSeverity.MEDIUM]: 'warning',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'fatal',
    };
    return mapping[severity];
  }
}

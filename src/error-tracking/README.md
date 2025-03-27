# Error Tracking Module

This module provides centralized error tracking functionality for the StarkhiveBackend application. It includes integration with Sentry, error logging to a database, and an alerting system for critical errors.

## Features

- Automatic error capturing through middleware
- Integration with Sentry for error monitoring
- Database storage of error logs
- Email alerts for critical errors
- API endpoints for retrieving error logs (admin only)
- Proper handling of sensitive data

## Configuration

Add the following environment variables to your `.env` file:

```env
# Sentry Configuration
SENTRY_DSN=your_sentry_dsn

# Email Alert Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=alerts@your-domain.com
ERROR_ALERT_EMAILS=admin1@example.com,admin2@example.com
```

## Usage

The error tracking middleware is automatically applied to all routes. Errors will be:
1. Logged to the database
2. Sent to Sentry
3. Trigger email alerts if critical

### Error Severity Levels

- LOW: Minor issues (e.g., auth failures)
- MEDIUM: Standard application errors
- HIGH: Server errors (5xx)
- CRITICAL: Unhandled exceptions

### API Endpoints

#### GET /error-tracking

Retrieve error logs (admin access required)

Query Parameters:
- severity: ErrorSeverity (low, medium, high, critical)
- startDate: Date
- endDate: Date
- userId: UUID
- page: number
- limit: number

Response:
```json
{
  "errors": [
    {
      "id": "uuid",
      "message": "Error message",
      "errorCode": "ERROR_CODE",
      "severity": "CRITICAL",
      "stackTrace": "...",
      "path": "/api/endpoint",
      "method": "POST",
      "createdAt": "2024-03-24T12:00:00Z",
      "metadata": {
        "headers": {},
        "query": {},
        "body": {}
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

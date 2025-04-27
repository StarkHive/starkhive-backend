# Data Anonymization Module

This module provides GDPR-compliant data anonymization capabilities for the Starkhive platform.

## Overview

The anonymization module is responsible for:
- Pseudonymizing personally identifiable information (PII)
- Managing data anonymization in exports and reports
- Providing secure endpoints for manual anonymization

## Data Fields Requiring Anonymization

### User Data
- email (pseudonymized)
- username (pseudonymized)
- walletAddress (hashed)
- password (removed)
- emailTokenVerification (removed)
- resetToken (removed)
- tokenExpires (removed)

### Retained Fields
- id (for reference)
- isEmailVerified
- createdAt
- updatedAt

## Implementation Details

### Anonymization Methods
1. **Pseudonymization**: 
   - Emails are converted to a format: `hash@anonymous.com`
   - Usernames are converted to: `user_[hash]`

2. **Hashing**:
   - Sensitive data is hashed using HMAC-SHA256
   - A salt is used to prevent rainbow table attacks

### Security Measures
- Data is anonymized before export
- Original data remains intact in the database
- Access to anonymization endpoints is restricted to admin users
- Middleware automatically handles anonymization for specific routes

## Usage

### Automatic Anonymization
The middleware automatically anonymizes data for routes:
- `/users/search`
- `/users/export`
- `/reports/*`

### Manual Anonymization
Endpoint: `POST /anonymization/anonymize-data`
```typescript
// Request body
{
  "data": { /* data to anonymize */ },
  "fieldsToAnonymize": ["field1", "field2"]
}
```

### Context-Based Anonymization
Set the `x-data-context` header to control anonymization:
- `public_profile`
- `search_results`

## Best Practices
1. Always use the anonymization service for exports and reports
2. Never expose sensitive data in public APIs
3. Use appropriate context headers for data access
4. Regularly audit data access patterns
5. Keep anonymization salt secure and rotated

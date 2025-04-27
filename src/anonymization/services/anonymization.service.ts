import { Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AnonymizationService {
  private readonly ANONYMIZATION_SALT = process.env.ANONYMIZATION_SALT || 'default-salt';

  // Pseudonymize email while maintaining uniqueness
  private pseudonymizeEmail(email: string): string {
    const hash = crypto
      .createHmac('sha256', this.ANONYMIZATION_SALT)
      .update(email)
      .digest('hex');
    return `${hash.substring(0, 8)}@anonymous.com`;
  }

  // Hash sensitive data with salt
  private hashData(data: string): string {
    return crypto
      .createHmac('sha256', this.ANONYMIZATION_SALT)
      .update(data)
      .digest('hex');
  }

  // Anonymize user data
  async anonymizeUser(user: User): Promise<Partial<User>> {
    return {
      id: user.id, // Keep ID for reference
      email: this.pseudonymizeEmail(user.email),
      username: `user_${this.hashData(user.username || '').substring(0, 8)}`,
      walletAddress: user.walletAddress ? this.hashData(user.walletAddress) : undefined,
      // Remove sensitive fields
      password: undefined,
      emailTokenVerification: undefined,
      resetToken: undefined,
      tokenExpires: undefined,
      // Keep non-sensitive data
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  // Anonymize array of users
  async anonymizeUsers(users: User[]): Promise<Partial<User>[]> {
    return Promise.all(users.map(user => this.anonymizeUser(user)));
  }

  // Anonymize specific fields
  async anonymizeFields(data: Record<string, any>, fieldsToAnonymize: string[]): Promise<Record<string, any>> {
    const anonymizedData = { ...data };
    for (const field of fieldsToAnonymize) {
      if (data[field]) {
        anonymizedData[field] = this.hashData(data[field]);
      }
    }
    return anonymizedData;
  }

  // Check if data needs anonymization based on context
  shouldAnonymize(context: string): boolean {
    const publicContexts = ['public_profile', 'search_results'];
    return publicContexts.includes(context);
  }
}

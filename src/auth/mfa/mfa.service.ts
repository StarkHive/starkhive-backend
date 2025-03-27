import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UserService } from '../../user/user.service';

@Injectable()
export class MfaService {
  constructor(private readonly userService: UserService) {}

  async generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `BackendHive:${userId}`,
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate OTP auth URL');
    }

    // Store the secret temporarily (you might want to store this in Redis or similar)
    // In a real implementation, you should store this securely
    await this.userService.updateUser(userId, {
      mfaSecret: secret.base32,
      mfaEnabled: false, // Will be enabled after verification
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verifyAndEnableMfa(userId: string, token: string) {
    const user = await this.userService.findOne(userId);

    if (!user.mfaSecret) {
      throw new UnauthorizedException(
        'MFA secret not found. Please generate a new secret.',
      );
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    // Enable MFA for the user
    await this.userService.updateUser(userId, {
      mfaEnabled: true,
    });

    return { success: true };
  }

  async disableMfa(userId: string) {
    await this.userService.updateUser(userId, {
      mfaEnabled: false,
      mfaSecret: null,
    });

    return { success: true };
  }

  async verifyMfaToken(userId: string, token: string) {
    const user = await this.userService.findOne(userId);

    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('MFA is not enabled for this user');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    return { success: true };
  }
}

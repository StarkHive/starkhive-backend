/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '@src/user/dto/create-user.dto';
import { User } from '@src/user/entities/user.entity';
import { hash } from 'starknet';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  forgotPasswordDTO,
  LoginDto,
  resetPasswordDTO,
  VerifyEmailDto,
} from './dtos/auth.dto';
import { generateUniqueKey, UtilService } from './utils/utils.function';
import { emailverification } from '../Email/verification';
import { MfaService } from './mfa/mfa.service';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly utilService: UtilService,
    private readonly mfaService: MfaService,
  ) {}

  private generateNonce(): string {
    return Math.floor(Math.random() * 1000000).toString();
  }

  async generateAuthMessage(
    _walletAddress: string,
  ): Promise<{ message: string; nonce: string }> {
    const nonce = this.generateNonce();
    const message = `Welcome to StarkHive!\n\nPlease sign this message to authenticate.\n\nNonce: ${nonce}`;
    return { message, nonce };
  }

  async verifySignature(
    _walletAddress: string,
    signature: string[],
    message: string,
  ): Promise<boolean> {
    try {
      // Basic validation of signature format
      const isValidFormat = signature.every(
        (sig) => sig && sig.startsWith('0x') && sig.length > 2,
      );

      if (!isValidFormat) {
        throw new UnauthorizedException('Invalid signature format');
      }

      // Convert message to hash using Starknet's hash function
      const messageHash = hash.starknetKeccak(message);

      // In a production environment, you would use this messageHash
      // with your specific Starknet contract's verification method
      // For now, we just verify the signature format and hash generation
      return messageHash !== BigInt(0);
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  async generateToken(walletAddress: string): Promise<string> {
    const payload = { sub: walletAddress };
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async registerUser(dto: CreateUserDto): Promise<any> {
    try {
      const email = dto.email.toLowerCase();
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      const hashedPassword = await this.utilService.hashPassword(dto.password);

      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        emailTokenVerification: await generateUniqueKey(6),
        walletAddress: dto?.walletAddress,
        username: dto?.username,
      });

      user.tokenExpires = new Date(Date.now() + 15 * 60 * 1000);
      await this.userRepository.save(user);

      await emailverification({
        name: user.username || email.split('@')[0],
        email: user.email,
        code: user.emailTokenVerification,
        type: 'Registration Token',
      });

      const token = await this.utilService.generateJwt(user);

      return {
        data: { user, accessToken: token },
        success: true,
        code: HttpStatus.CREATED,
        message: 'Account created successfully. Please verify your email.',
      };
    } catch (error) {
      console.error('User Registration Error:', error);
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async verifyEmail(userId: string, dto: VerifyEmailDto): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      if (dto.code !== user.emailTokenVerification) {
        throw new BadRequestException('Wrong Verification Code, try again');
      }

      if (user.tokenExpires && user.tokenExpires < new Date()) {
        throw new BadRequestException(
          'Verification token has expired. Please request a new one.',
        );
      }

      user.isEmailVerified = true;
      user.emailTokenVerification = ' ';
      await this.userRepository.save(user);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Email Verified Successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Email verification failed');
    }
  }

  async login(dto: LoginDto): Promise<any> {
    try {
      const email = dto.email.toLowerCase();
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isEmailVerified) {
        throw new BadRequestException(
          'Please verify your email before logging in.',
        );
      }

      const isPasswordValid = await this.utilService.confirmPassword(
        dto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if MFA is enabled
      if (user.mfaEnabled) {
        if (!dto.mfaToken) {
          return {
            data: { 
              requiresMfa: true,
              userId: user.id,
              message: 'MFA token required'
            },
            success: true,
            code: HttpStatus.OK,
            message: 'MFA verification required',
          };
        }

        // Verify MFA token
        const mfaValid = await this.mfaService.verifyMfaToken(user.id, dto.mfaToken);
        
        if (!mfaValid.success) {
          throw new UnauthorizedException('Invalid MFA token');
        }
      }

      const accessToken = await this.utilService.generateJwt(user);

      return {
        data: { user, accessToken },
        success: true,
        code: HttpStatus.OK,
        message: 'Login successful',
      };
    } catch (error) {
      throw new InternalServerErrorException('Login failed. Please try again.');
    }
  }

  async forgotPassword(dto: forgotPasswordDTO): Promise<any> {
    try {
      const email = dto.email.toLowerCase();
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const resetToken = generateUniqueKey(6);
      user.resetToken = resetToken;
      user.tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

      await this.userRepository.save(user);

      await emailverification({
        name: user.username || email.split('@')[0],
        email: user.email,
        code: resetToken,
        type: 'Reset Token',
      });

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Reset code sent to your email',
      };
    } catch (error) {
      console.error('Forgot Password Error:', error);
      throw new InternalServerErrorException(
        'Failed to process forgot password request',
      );
    }
  }

  async resetPassword(dto: resetPasswordDTO): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { resetToken: dto.resetToken },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (user.tokenExpires && user.tokenExpires < new Date()) {
        throw new BadRequestException(
          'Reset token has expired. Please request a new one.',
        );
      }

      if (!dto.newPassword) {
        throw new BadRequestException('New password is required');
      }

      const isSameAsCurrent = await this.utilService.confirmPassword(
        dto.newPassword,
        user.password,
      );
      if (isSameAsCurrent) {
        throw new BadRequestException(
          'You cannot reset your password to the current one',
        );
      }

      user.password = await this.utilService.hashPassword(dto.newPassword);
      user.resetToken = ' ';

      await this.userRepository.save(user);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Password reset successful',
      };
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }
}

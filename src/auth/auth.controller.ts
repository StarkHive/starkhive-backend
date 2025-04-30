import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WalletAddress } from './decorators/wallet-address.decorator';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dtos/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { OAuthGuard } from './guards/oauth.guard';
import { VerifySiweDto } from './dtos/verify-siwes.dto';
import { RequestNonceDto } from './dtos/request-nonce.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('connect')
  async connectWallet(@Body('walletAddress') walletAddress: string) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address is required');
    }
    return this.authService.generateAuthMessage(walletAddress);
  }

  @Post('verify')
  async verifyWallet(
    @Body()
    body: {
      walletAddress: string;
      signature: string[];
      message: string;
    },
  ) {
    const { walletAddress, signature, message } = body;

    const isValid = await this.authService.verifySignature(
      walletAddress,
      signature,
      message,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const token = await this.authService.generateToken(walletAddress);
    return { token };
  }

  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  async testProtectedRoute(@WalletAddress() walletAddress: string) {
    return {
      message: 'You are authenticated!',
      walletAddress,
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Initiates Google OAuth login
  }

  @Get('google/callback')
  @UseGuards(new OAuthGuard('google'))
  googleCallback(@Req() req: Request) {
    return req.user;
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {
    // Initiates GitHub OAuth
  }

  @Get('github/callback')
  @UseGuards(new OAuthGuard('github'))
  githubCallback(@Req() req: Request) {
    return req.user;
  }

  @Get('error')
  authError(@Query('message') message: string) {
    return {
      success: false,
      error: message || 'Authentication failed',
    };
  }
  // @Get('linkedin')
  // @UseGuards(AuthGuard('linkedin'))
  // linkedinLogin() {
  //   // Initiates LinkedIn OAuth
  // }

  // @Get('linkedin/callback')
  // @UseGuards(AuthGuard('linkedin'))
  // linkedinCallback(@Req() req: Request, @Res() res: Response) {
  //   // Successful authentication
  //   res.redirect('/profile');
  // }
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('request-nonce')
  requestNonce(@Body() dto: RequestNonceDto) {
    const nonce = this.authService.generatesNonce(dto.address);
    return { nonce };
  }

  @Post('verify')
  verify(@Body() dto: VerifySiweDto) {
    return this.authService.verifySiweMessage(dto.message, dto.signature);
  }
}

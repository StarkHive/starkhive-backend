import { Controller, Post, Body, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WalletAddress } from './decorators/wallet-address.decorator';

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
        @Body() body: { walletAddress: string; signature: string[]; message: string },
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
            walletAddress
        };
    }
}

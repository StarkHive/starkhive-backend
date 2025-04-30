import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referral')
export class ReferralController {
    constructor(private readonly referralService: ReferralService) {}

    @Post('generate/:userId')
    async generateReferralCode(@Param('userId') userId: number): Promise<string> {
        return this.referralService.generateReferralCode(userId.toString());
    }

    @Post('track')
    async trackSignup(@Body('referralCode') referralCode: string): Promise<void> {
        await this.referralService.trackSignup(referralCode);
    }

    @Get('stats/:userId')
    async getReferralStats(@Param('userId') userId: number): Promise<any> {
        return this.referralService.getReferralStats(userId);
    }
}

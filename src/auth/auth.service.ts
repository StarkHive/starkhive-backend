import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'starknet';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    private generateNonce(): string {
        return Math.floor(Math.random() * 1000000).toString();
    }

    async generateAuthMessage(walletAddress: string): Promise<{ message: string; nonce: string }> {
        const nonce = this.generateNonce();
        const message = `Welcome to StarkHive!\n\nPlease sign this message to authenticate.\n\nNonce: ${nonce}`;
        return { message, nonce };
    }

    async verifySignature(
        walletAddress: string,
        signature: string[],
        message: string,
    ): Promise<boolean> {
        try {
            // Basic validation of signature format
            const isValidFormat = signature.every(sig => 
                sig && sig.startsWith('0x') && sig.length > 2
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
}

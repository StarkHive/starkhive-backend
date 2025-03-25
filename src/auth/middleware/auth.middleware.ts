/* eslint-disable prettier/prettier */
import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth.service';

interface AuthenticatedRequest extends Request {
    user?: {
        role?: string;
        walletAddress?: string;
    };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService) {}

    async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            // Extract JWT token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('No valid authorization token provided');
            }

            const token = authHeader.split(' ')[1];
            
            // Validate the token and get wallet address
            const payload = await this.authService.validateToken(token);
            
            // Set user information in request
            req.user = {
                ...req.user,
                walletAddress: payload.sub
            };

            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}

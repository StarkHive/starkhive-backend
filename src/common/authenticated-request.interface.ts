/* eslint-disable prettier/prettier */
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User; // Ensure TypeScript recognizes `req.user`
}

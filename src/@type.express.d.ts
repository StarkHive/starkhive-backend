// src/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;   // User ID
        email: string; // User email
        // Add other properties if needed
      };
    }
  }
}
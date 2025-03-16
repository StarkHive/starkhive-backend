/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from 'src/sessions/session.service';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async login(user: User, req: Request) {
    const payload = { username: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    await this.sessionService.createSession(
      user,
      req.ip,
      req.headers['user-agent'] || 'Unknown Device',
    );

    return { accessToken: token };
  }
}

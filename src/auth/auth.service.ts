/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/sessions/session.entity';
import { User } from 'src/user/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class AuthService {
  generateRefreshToken: any;
  generateJwt: any;
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async login(user: User, req: Request) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const session = this.sessionRepository.create({
      user,
      ipAddress: ip,
      userAgent,
    });
    await this.sessionRepository.save(session);

    return {
      accessToken: this.generateJwt(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
}

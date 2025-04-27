import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || '',
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL') || '',
      scope: ['r_emailaddress', 'r_liteprofile'],
      passReqToCallback: true, // Keep this if using request-based authentication
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    try {
      // LinkedIn returns names in a nested structure
      const name = `${profile.name.givenName} ${profile.name.familyName}`;

      const user = await this.authService.findOrCreateFromOAuth({
        email: profile.emails[0].value,
        provider: 'linkedin',
        providerId: profile.id,
        name,
      });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}

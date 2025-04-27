import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface GitHubProfile {
  id: string;
  displayName: string;
  username: string;
  photos?: Array<{ value: string }>;
  profileUrl?: string;
  _json?: {
    login?: string;
    avatar_url?: string;
    html_url?: string;
    name?: string;
    company?: string;
    blog?: string;
    location?: string;
    bio?: string;
  };
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || '',
      scope: ['user:email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request, // Add this parameter
    accessToken: string,
    _refreshToken: string,
    profile: GitHubProfile,
    done: (err: any, user: any) => void,
  ) {
    try {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${accessToken}` },
      });
      const emails: GitHubEmail[] = await emailsResponse.json();

      const primaryEmail = emails.find(
        (email) => email.primary && email.verified,
      );

      if (!primaryEmail) {
        throw new Error('No verified primary email found');
      }

      const user = await this.authService.findOrCreateFromOAuth({
        email: primaryEmail.email,
        provider: 'github',
        providerId: profile.id,
        name: profile.displayName || profile.username || 'GitHub User',
      });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OAuthGuard extends AuthGuard('oauth') {
  constructor(provider: string) {
    super({
      failureRedirect: '/auth/error',
      session: false,
    });
    this.strategyName = provider;
  }

  private strategyName: string;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    request.params.provider = this.strategyName;

    try {
      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      const response = context.switchToHttp().getResponse();
      response.redirect('/auth/error');
      return false;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const response = context.switchToHttp().getResponse();
      response.redirect('/auth/error');
      return null;
    }
    return user;
  }
}

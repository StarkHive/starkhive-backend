// auth/guards/oauth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OAuthGuard } from './guards/oauth.guard';
import { AuthService } from '../auth.service';
import { PassportModule } from '@nestjs/passport';
import { Request, Response } from 'express';

describe('OAuthGuard', () => {
  let guard: OAuthGuard;
  let mockAuthService: Partial<AuthService>;

  const mockContext = (provider: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        params: { provider },
        session: {},
        logIn: jest.fn(),
      }),
      getResponse: () => ({
        redirect: jest.fn(),
      }),
    }),
  });

  beforeEach(async () => {
    mockAuthService = {
      findOrCreateFromOAuth: jest.fn().mockImplementation((data) => ({
        id: 'user-id',
        email: data.email,
        providers: [data.provider],
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'oauth' })],
      providers: [
        OAuthGuard,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    guard = module.get<OAuthGuard>(OAuthGuard);
  });

  describe('Google OAuth', () => {
    const provider = 'google';

    it('should authenticate successfully', async () => {
      const context = mockContext(provider) as unknown as ExecutionContext;
      const canActivate = await guard.canActivate(context);

      expect(canActivate).toBe(true);
      expect(mockAuthService.findOrCreateFromOAuth).toHaveBeenCalledWith({
        email: expect.any(String),
        provider: 'google',
        providerId: expect.any(String),
        name: expect.any(String),
      });
    });

    it('should redirect on authentication failure', async () => {
      jest
        .spyOn(guard, 'canActivate')
        .mockRejectedValueOnce(new Error('Failed'));

      const context = mockContext(provider) as unknown as ExecutionContext;
      const response = context.switchToHttp().getResponse();

      await guard.canActivate(context);
      expect(response.redirect).toHaveBeenCalledWith('/auth/error');
    });

    it('should handle existing user with different provider', async () => {
      mockAuthService.findOrCreateFromOAuth = jest
        .fn()
        .mockImplementationOnce((data) => ({
          id: 'existing-user-id',
          email: data.email,
          providers: ['github', 'google'],
        }));

      const context = mockContext(provider) as unknown as ExecutionContext;
      await guard.canActivate(context);

      expect(mockAuthService.findOrCreateFromOAuth).toHaveBeenCalled();
      const user = await mockAuthService.findOrCreateFromOAuth(null);
      expect(user.providers).toContain('google');
    });
  });

  describe('GitHub OAuth', () => {
    const provider = 'github';

    it('should authenticate with GitHub', async () => {
      const context = mockContext(provider) as unknown as ExecutionContext;
      const canActivate = await guard.canActivate(context);

      expect(canActivate).toBe(true);
      expect(mockAuthService.findOrCreateFromOAuth).toHaveBeenCalledWith({
        email: expect.any(String),
        provider: 'github',
        providerId: expect.any(String),
        name: expect.any(String),
      });
    });

    it('should handle GitHub email verification failure', async () => {
      mockAuthService.findOrCreateFromOAuth = jest
        .fn()
        .mockRejectedValueOnce(new Error('No verified primary email found'));

      const context = mockContext(provider) as unknown as ExecutionContext;
      const response = context.switchToHttp().getResponse();

      await guard.canActivate(context);
      expect(response.redirect).toHaveBeenCalledWith('/auth/error');
    });

    it('should merge GitHub auth with existing user', async () => {
      mockAuthService.findOrCreateFromOAuth = jest
        .fn()
        .mockImplementationOnce((data) => ({
          id: 'existing-user-id',
          email: data.email,
          providers: ['google', 'github'],
        }));

      const context = mockContext(provider) as unknown as ExecutionContext;
      await guard.canActivate(context);

      expect(mockAuthService.findOrCreateFromOAuth).toHaveBeenCalled();
      const user = await mockAuthService.findOrCreateFromOAuth(null);
      expect(user.providers).toContain('github');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid provider', async () => {
      const context = mockContext('invalid') as unknown as ExecutionContext;
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle strategy errors', async () => {
      jest
        .spyOn(guard, 'canActivate')
        .mockRejectedValueOnce(new Error('Strategy error'));
      const context = mockContext('google') as unknown as ExecutionContext;
      const response = context.switchToHttp().getResponse();

      await guard.canActivate(context);
      expect(response.redirect).toHaveBeenCalledWith('/auth/error');
    });
  });
});

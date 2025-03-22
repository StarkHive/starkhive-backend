import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UtilService } from './utils/utils.function';
import { UserModule } from '@src/user/user.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
            inject: [ConfigService],
        }),
        UserModule
    ],
    providers: [AuthService, JwtStrategy, UtilService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AutenticacaoController } from './auth.controller';
import { AutenticacaoGuard } from './auth.guard';
import { AutenticacaoService } from './auth.service';
import { PapeisGuard } from './papeis.guard';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '8h' },
            }),
        }),
    ],
    controllers: [AutenticacaoController],
    providers: [AutenticacaoService, AutenticacaoGuard, PapeisGuard],
    exports: [AutenticacaoGuard, PapeisGuard, JwtModule],
})
export class AutenticacaoModule {}

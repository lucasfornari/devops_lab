import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoGuard } from './autenticacao.guard';
import { AutenticacaoService } from './autenticacao.service';
import { PermissaoPorPapelGuard } from './permissao-por-papel.guard';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { algorithm: 'HS256', expiresIn: '8h' },
                verifyOptions: { algorithms: ['HS256'] },
            }),
        }),
    ],
    controllers: [AutenticacaoController],
    providers: [
        AutenticacaoService,
        { provide: APP_GUARD, useClass: AutenticacaoGuard },
        { provide: APP_GUARD, useClass: PermissaoPorPapelGuard },
    ],
})
export class AutenticacaoModule {}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { ROTA_PUBLICA } from './autenticacao.decorators';
import { UsuarioAutenticado } from './autenticacao.types';

@Injectable()
export class AutenticacaoGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(contexto: ExecutionContext): Promise<boolean> {
        const publica = this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [
            contexto.getHandler(),
            contexto.getClass(),
        ]);
        if (publica) {
            return true;
        }

        const requisicao = contexto.switchToHttp().getRequest<{
            headers: { authorization?: string };
            usuario?: UsuarioAutenticado;
        }>();
        const cabecalho = requisicao.headers.authorization;

        if (!cabecalho?.startsWith('Bearer ')) {
            throw new UnauthorizedException('token de autenticação ausente');
        }

        const dadosDoToken = this.verificarToken(cabecalho.slice(7));

        // O papel vem do banco, e não do token, para que mudanças de papel e exclusões valham na hora.
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: dadosDoToken.id },
            select: { id: true, papel: true },
        });
        if (!usuario) {
            throw new UnauthorizedException('usuário não encontrado');
        }

        requisicao.usuario = usuario;
        return true;
    }

    private verificarToken(token: string) {
        try {
            return this.jwtService.verify<UsuarioAutenticado>(token);
        } catch {
            throw new UnauthorizedException('token de autenticação inválido');
        }
    }
}

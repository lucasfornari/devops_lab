import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { UsuarioAutenticado } from './auth.types';

@Injectable()
export class AutenticacaoGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async canActivate(contexto: ExecutionContext): Promise<boolean> {
        const request = contexto.switchToHttp().getRequest<{
            headers: { authorization?: string };
            usuario?: UsuarioAutenticado;
        }>();
        const cabecalho = request.headers.authorization;

        if (!cabecalho?.startsWith('Bearer ')) {
            throw new UnauthorizedException('token de autenticação ausente');
        }

        const payload = this.verificarToken(cabecalho.slice(7));

        // O papel vem do banco, e não do token, para que mudanças de papel e exclusões valham na hora.
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: payload.id },
            select: { id: true, papel: true },
        });
        if (!usuario) {
            throw new UnauthorizedException('usuário não encontrado');
        }

        request.usuario = usuario;
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

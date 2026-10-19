import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { ROTA_PUBLICA } from './autenticacao.decorators';
import { DadosDoToken, RequisicaoAutenticada, UsuarioAutenticado } from './autenticacao.types';

const PREFIXO_BEARER = 'Bearer ';

@Injectable()
export class AutenticacaoGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(contexto: ExecutionContext): Promise<boolean> {
        if (this.rotaEhPublica(contexto)) {
            return true;
        }

        const requisicao = contexto.switchToHttp().getRequest<RequisicaoAutenticada>();
        const token = this.extrairToken(requisicao);
        const dadosDoToken = this.verificarToken(token);

        requisicao.usuario = await this.buscarUsuario(dadosDoToken.id);
        return true;
    }

    private rotaEhPublica(contexto: ExecutionContext): boolean {
        const publica = this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [
            contexto.getHandler(),
            contexto.getClass(),
        ]);
        return publica === true;
    }

    private extrairToken(requisicao: RequisicaoAutenticada): string {
        const cabecalho = requisicao.headers.authorization;

        if (!cabecalho || !cabecalho.startsWith(PREFIXO_BEARER)) {
            throw new UnauthorizedException('token de autenticação ausente');
        }

        return cabecalho.slice(PREFIXO_BEARER.length);
    }

    private verificarToken(token: string): DadosDoToken {
        try {
            return this.jwtService.verify<DadosDoToken>(token);
        } catch {
            throw new UnauthorizedException('token de autenticação inválido');
        }
    }

    // O papel vem do banco, e não do token, para que mudanças de papel e exclusões valham na hora.
    private async buscarUsuario(id: number): Promise<UsuarioAutenticado> {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            select: { id: true, papel: true },
        });

        if (!usuario) {
            throw new UnauthorizedException('usuário não encontrado');
        }

        return usuario;
    }
}

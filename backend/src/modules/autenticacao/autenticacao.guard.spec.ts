import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Papel } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { AutenticacaoGuard } from './autenticacao.guard';
import { RequisicaoAutenticada, UsuarioAutenticado } from './autenticacao.types';

const usuarioDoBanco: UsuarioAutenticado = { id: 1, papel: Papel.USUARIO };

function criarRequisicao(authorization?: string): RequisicaoAutenticada {
    return { headers: { authorization } };
}

function criarContexto(requisicao: RequisicaoAutenticada): ExecutionContext {
    return {
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({ getRequest: () => requisicao }),
    } as unknown as ExecutionContext;
}

function criarGuard(opcoes: { rotaPublica?: boolean; tokenValido?: boolean; usuarioExiste?: boolean } = {}) {
    const { rotaPublica = false, tokenValido = true, usuarioExiste = true } = opcoes;

    const reflector = { getAllAndOverride: () => rotaPublica } as unknown as Reflector;

    const jwtService = {
        verify: () => {
            if (!tokenValido) {
                throw new Error('assinatura inválida');
            }
            return { id: usuarioDoBanco.id };
        },
    } as unknown as JwtService;

    const prisma = {
        usuario: { findUnique: async () => (usuarioExiste ? usuarioDoBanco : null) },
    } as unknown as PrismaService;

    return new AutenticacaoGuard(jwtService, prisma, reflector);
}

describe('AutenticacaoGuard', () => {
    it('libera rota pública mesmo sem token', async () => {
        const guard = criarGuard({ rotaPublica: true });
        const requisicao = criarRequisicao();

        await expect(guard.canActivate(criarContexto(requisicao))).resolves.toBe(true);
        expect(requisicao.usuario).toBeUndefined();
    });

    it('barra quando não há cabeçalho Authorization', async () => {
        const guard = criarGuard();

        await expect(guard.canActivate(criarContexto(criarRequisicao()))).rejects.toThrow(UnauthorizedException);
    });

    it('barra quando o cabeçalho não usa o esquema Bearer', async () => {
        const guard = criarGuard();
        const requisicao = criarRequisicao('Basic abc123');

        await expect(guard.canActivate(criarContexto(requisicao))).rejects.toThrow(UnauthorizedException);
    });

    it('barra quando o token é inválido ou expirou', async () => {
        const guard = criarGuard({ tokenValido: false });
        const requisicao = criarRequisicao('Bearer token-ruim');

        await expect(guard.canActivate(criarContexto(requisicao))).rejects.toThrow(UnauthorizedException);
    });

    it('barra quando o usuário do token não existe mais', async () => {
        const guard = criarGuard({ usuarioExiste: false });
        const requisicao = criarRequisicao('Bearer token-bom');

        await expect(guard.canActivate(criarContexto(requisicao))).rejects.toThrow(UnauthorizedException);
    });

    it('libera e coloca o usuário do banco na requisição quando o token é válido', async () => {
        const guard = criarGuard();
        const requisicao = criarRequisicao('Bearer token-bom');

        await expect(guard.canActivate(criarContexto(requisicao))).resolves.toBe(true);
        expect(requisicao.usuario).toEqual(usuarioDoBanco);
    });
});

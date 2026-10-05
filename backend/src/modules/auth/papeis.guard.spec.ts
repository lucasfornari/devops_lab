import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Papel } from '@prisma/client';

import { PapeisGuard } from './papeis.guard';

function criarContexto(papel?: Papel): ExecutionContext {
    return {
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({
            getRequest: () => ({ usuario: papel ? { id: 1, papel } : undefined }),
        }),
    } as unknown as ExecutionContext;
}

describe('PapeisGuard', () => {
    function criarGuard(papeisExigidos?: Papel[]) {
        const reflector = { getAllAndOverride: () => papeisExigidos } as unknown as Reflector;
        return new PapeisGuard(reflector);
    }

    it('libera quando a rota não exige papel', () => {
        expect(criarGuard().canActivate(criarContexto(Papel.USUARIO))).toBe(true);
    });

    it('libera quando o usuário tem um dos papéis exigidos', () => {
        const guard = criarGuard([Papel.AGENTE, Papel.ADMIN]);
        expect(guard.canActivate(criarContexto(Papel.ADMIN))).toBe(true);
    });

    it('barra quando o usuário não tem o papel exigido', () => {
        const guard = criarGuard([Papel.ADMIN]);
        expect(() => guard.canActivate(criarContexto(Papel.USUARIO))).toThrow(ForbiddenException);
    });
});

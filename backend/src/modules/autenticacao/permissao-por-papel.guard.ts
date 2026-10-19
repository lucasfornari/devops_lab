import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Papel } from '@prisma/client';

import { PAPEIS_PERMITIDOS } from './autenticacao.decorators';
import { RequisicaoAutenticada } from './autenticacao.types';

@Injectable()
export class PermissaoPorPapelGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(contexto: ExecutionContext): boolean {
        const papeisPermitidos = this.reflector.getAllAndOverride<Papel[]>(PAPEIS_PERMITIDOS, [
            contexto.getHandler(),
            contexto.getClass(),
        ]);

        const rotaNaoExigePapel = !papeisPermitidos || papeisPermitidos.length === 0;
        if (rotaNaoExigePapel) {
            return true;
        }

        const usuario = contexto.switchToHttp().getRequest<RequisicaoAutenticada>().usuario;
        const usuarioTemPapelPermitido = usuario !== undefined && papeisPermitidos.includes(usuario.papel);

        if (!usuarioTemPapelPermitido) {
            throw new ForbiddenException('acesso negado para este papel');
        }

        return true;
    }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PAPEIS_PERMITIDOS } from './autenticacao.decorators';
import { UsuarioAutenticado } from './autenticacao.types';
import { Papel } from '@prisma/client';

@Injectable()
export class PermissaoPorPapelGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(contexto: ExecutionContext): boolean {
        const papeis = this.reflector.getAllAndOverride<Papel[]>(PAPEIS_PERMITIDOS, [
            contexto.getHandler(),
            contexto.getClass(),
        ]);

        if (!papeis?.length) {
            return true;
        }

        const requisicao = contexto.switchToHttp().getRequest<{ usuario?: UsuarioAutenticado }>();
        if (!requisicao.usuario || !papeis.includes(requisicao.usuario.papel)) {
            throw new ForbiddenException('acesso negado para este papel');
        }

        return true;
    }
}

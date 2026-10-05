import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PAPEIS_AUTORIZADOS } from './auth.decorator';
import { UsuarioAutenticado } from './auth.types';
import { Papel } from '@prisma/client';

@Injectable()
export class PapeisGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(contexto: ExecutionContext): boolean {
        const papeis = this.reflector.getAllAndOverride<Papel[]>(PAPEIS_AUTORIZADOS, [
            contexto.getHandler(),
            contexto.getClass(),
        ]);

        if (!papeis?.length) {
            return true;
        }

        const request = contexto.switchToHttp().getRequest<{ usuario?: UsuarioAutenticado }>();
        if (!request.usuario || !papeis.includes(request.usuario.papel)) {
            throw new ForbiddenException('acesso negado para este papel');
        }

        return true;
    }
}

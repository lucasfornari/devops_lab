import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

import { Papel } from '@prisma/client';
import { UsuarioAutenticado } from './auth.types';

export const PAPEIS_AUTORIZADOS = 'papeis_autorizados';
export const Papeis = (...papeis: Papel[]) => SetMetadata(PAPEIS_AUTORIZADOS, papeis);

export const UsuarioAtual = createParamDecorator(
    (_data: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
        const request = contexto.switchToHttp().getRequest<{ usuario: UsuarioAutenticado }>();
        return request.usuario;
    },
);

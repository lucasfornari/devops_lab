import { createParamDecorator, ExecutionContext, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Papel } from '@prisma/client';

import { RequisicaoAutenticada, UsuarioAutenticado } from './autenticacao.types';

export const PAPEIS_PERMITIDOS = 'papeis_permitidos';
export const PermitirPapeis = (...papeis: Papel[]) => SetMetadata(PAPEIS_PERMITIDOS, papeis);

export const ROTA_PUBLICA = 'rota_publica';
export const RotaPublica = () => SetMetadata(ROTA_PUBLICA, true);

export const UsuarioAtual = createParamDecorator(
    (_data: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
        const requisicao = contexto.switchToHttp().getRequest<RequisicaoAutenticada>();

        if (!requisicao.usuario) {
            throw new UnauthorizedException('usuário não autenticado');
        }

        return requisicao.usuario;
    },
);

import { Papel } from '@prisma/client';

export interface UsuarioAutenticado {
    id: number;
    papel: Papel;
}

export interface DadosDoToken {
    id: number;
}

export interface RequisicaoAutenticada {
    headers: { authorization?: string };
    usuario?: UsuarioAutenticado;
}

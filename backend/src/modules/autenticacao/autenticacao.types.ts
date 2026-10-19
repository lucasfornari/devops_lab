import { Papel } from '@prisma/client';

export interface UsuarioAutenticado {
    id: number;
    papel: Papel;
}

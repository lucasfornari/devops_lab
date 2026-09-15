import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';

const SELECT_PUBLICO = { id: true, nome: true, email: true, papel: true, criadoEm: true } as const;

export async function buscarPorId(id: number) {
    const usuario = await prisma.usuario.findUnique({ where: { id }, select: SELECT_PUBLICO });
    if (!usuario) {
        throw new AppError('usuário não encontrado', 404);
    }
    return usuario;
}

export async function listar() {
    return prisma.usuario.findMany({ select: SELECT_PUBLICO, orderBy: { nome: 'asc' } });
}

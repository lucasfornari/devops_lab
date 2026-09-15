import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { CriarCategoriaInput } from './categorias.schemas';

export async function listar() {
    return prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
}

export async function criar(dados: CriarCategoriaInput) {
    const existente = await prisma.categoria.findUnique({ where: { nome: dados.nome } });
    if (existente) {
        throw new AppError('já existe uma categoria com este nome', 409);
    }
    return prisma.categoria.create({ data: { nome: dados.nome } });
}

import { Papel, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { UsuarioAutenticado } from '../auth/auth.middleware';
import {
    AtualizarResponsavelInput,
    AtualizarStatusInput,
    CriarChamadoInput,
    CriarComentarioInput,
} from './chamados.schemas';

const SELECT_USUARIO_RESUMIDO = { id: true, nome: true, email: true } as const;

const INCLUDE_PADRAO = {
    categoria: true,
    solicitante: { select: SELECT_USUARIO_RESUMIDO },
    responsavel: { select: SELECT_USUARIO_RESUMIDO },
} satisfies Prisma.ChamadoInclude;

const INCLUDE_DETALHE = {
    ...INCLUDE_PADRAO,
    comentarios: {
        include: { autor: { select: SELECT_USUARIO_RESUMIDO } },
        orderBy: { criadoEm: 'asc' },
    },
} satisfies Prisma.ChamadoInclude;

function ehEquipeSuporte(papel: Papel): boolean {
    return papel === Papel.AGENTE || papel === Papel.ADMIN;
}

export async function criar(usuario: UsuarioAutenticado, dados: CriarChamadoInput) {
    return prisma.chamado.create({
        data: {
            titulo: dados.titulo,
            descricao: dados.descricao,
            prioridade: dados.prioridade,
            categoriaId: dados.categoriaId,
            solicitanteId: usuario.id,
        },
        include: INCLUDE_PADRAO,
    });
}

export async function listar(usuario: UsuarioAutenticado) {
    const where: Prisma.ChamadoWhereInput = ehEquipeSuporte(usuario.papel) ? {} : { solicitanteId: usuario.id };
    return prisma.chamado.findMany({ where, include: INCLUDE_PADRAO, orderBy: { criadoEm: 'desc' } });
}

async function buscarOuFalhar(id: number, usuario: UsuarioAutenticado) {
    const chamado = await prisma.chamado.findUnique({ where: { id }, include: INCLUDE_DETALHE });
    if (!chamado) {
        throw new AppError('chamado não encontrado', 404);
    }
    if (!ehEquipeSuporte(usuario.papel) && chamado.solicitanteId !== usuario.id) {
        throw new AppError('acesso negado a este chamado', 403);
    }
    return chamado;
}

export async function buscarPorId(id: number, usuario: UsuarioAutenticado) {
    return buscarOuFalhar(id, usuario);
}

export async function atualizarStatus(id: number, usuario: UsuarioAutenticado, dados: AtualizarStatusInput) {
    await buscarOuFalhar(id, usuario);
    return prisma.chamado.update({ where: { id }, data: { status: dados.status }, include: INCLUDE_PADRAO });
}

export async function atualizarResponsavel(
    id: number,
    usuario: UsuarioAutenticado,
    dados: AtualizarResponsavelInput
) {
    await buscarOuFalhar(id, usuario);
    const responsavel = await prisma.usuario.findUnique({ where: { id: dados.responsavelId } });
    if (!responsavel || !ehEquipeSuporte(responsavel.papel)) {
        throw new AppError('responsável deve ser um agente ou administrador', 400);
    }
    return prisma.chamado.update({
        where: { id },
        data: { responsavelId: dados.responsavelId },
        include: INCLUDE_PADRAO,
    });
}

export async function adicionarComentario(id: number, usuario: UsuarioAutenticado, dados: CriarComentarioInput) {
    await buscarOuFalhar(id, usuario);
    await prisma.comentario.create({
        data: { chamadoId: id, autorId: usuario.id, mensagem: dados.mensagem },
    });
    return buscarOuFalhar(id, usuario);
}

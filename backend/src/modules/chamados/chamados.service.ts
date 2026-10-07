import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Chamado, Papel, Prisma, StatusChamado } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { UsuarioAutenticado } from '../auth/auth.types';
import { AtualizarChamadoDto } from './dto/atualizar-chamado.dto';
import { AtualizarResponsavelDto } from './dto/atualizar-responsavel.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';
import { FiltroAtribuicao, ListarChamadosDto } from './dto/listar-chamados.dto';

const usuarioResumido = { id: true, nome: true, email: true } as const;
const incluirPadrao = {
    categoria: true,
    solicitante: { select: usuarioResumido },
    responsavel: { select: usuarioResumido },
} satisfies Prisma.ChamadoInclude;
const incluirDetalhe = {
    ...incluirPadrao,
    comentarios: {
        include: { autor: { select: usuarioResumido } },
        orderBy: { criadoEm: 'asc' },
    },
} satisfies Prisma.ChamadoInclude;

@Injectable()
export class ChamadosService {
    constructor(private readonly prisma: PrismaService) {}

    criar(usuario: UsuarioAutenticado, dados: CriarChamadoDto) {
        return this.prisma.chamado.create({
            data: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                prioridade: dados.prioridade,
                categoriaId: dados.categoriaId,
                solicitanteId: usuario.id,
            },
            include: incluirPadrao,
        });
    }

    listar(usuario: UsuarioAutenticado, filtros: ListarChamadosDto = {}) {
        const where: Prisma.ChamadoWhereInput = {
            status: filtros.status,
            prioridade: filtros.prioridade,
            categoriaId: filtros.categoriaId,
        };
        if (!this.ehEquipeSuporte(usuario.papel)) {
            where.solicitanteId = usuario.id;
        }
        if (filtros.atribuicao === FiltroAtribuicao.MEUS) {
            where.responsavelId = usuario.id;
        }
        if (filtros.atribuicao === FiltroAtribuicao.SEM_RESPONSAVEL) {
            where.responsavelId = null;
        }
        if (filtros.busca) {
            where.OR = [
                { titulo: { contains: filtros.busca, mode: 'insensitive' } },
                { descricao: { contains: filtros.busca, mode: 'insensitive' } },
            ];
        }
        return this.prisma.chamado.findMany({
            where,
            include: incluirPadrao,
            orderBy: { criadoEm: 'desc' },
        });
    }

    buscarPorId(id: number, usuario: UsuarioAutenticado) {
        return this.buscarOuFalhar(id, usuario);
    }

    async atualizar(id: number, usuario: UsuarioAutenticado, dados: AtualizarChamadoDto) {
        const chamado = await this.buscarOuFalhar(id, usuario);
        if (!this.podeEditar(chamado, usuario)) {
            throw new ForbiddenException('só é possível editar chamados que ainda estão abertos');
        }
        return this.prisma.chamado.update({
            where: { id },
            data: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                prioridade: dados.prioridade,
                categoriaId: dados.categoriaId,
            },
            include: incluirPadrao,
        });
    }

    async excluir(id: number, usuario: UsuarioAutenticado) {
        const chamado = await this.buscarOuFalhar(id, usuario);
        if (!this.podeExcluir(chamado, usuario)) {
            throw new ForbiddenException('só é possível excluir chamados que ainda estão abertos');
        }
        await this.prisma.chamado.delete({ where: { id } });
    }

    async atualizarStatus(id: number, usuario: UsuarioAutenticado, dados: AtualizarStatusDto) {
        await this.buscarOuFalhar(id, usuario);
        return this.prisma.chamado.update({
            where: { id },
            data: { status: dados.status },
            include: incluirPadrao,
        });
    }

    async atualizarResponsavel(id: number, usuario: UsuarioAutenticado, dados: AtualizarResponsavelDto) {
        await this.buscarOuFalhar(id, usuario);
        if (usuario.papel === Papel.AGENTE && dados.responsavelId !== usuario.id) {
            throw new ForbiddenException('agentes só podem assumir chamados para si');
        }
        const responsavel = await this.prisma.usuario.findUnique({ where: { id: dados.responsavelId } });
        if (!responsavel || !this.ehEquipeSuporte(responsavel.papel)) {
            throw new BadRequestException('responsável deve ser um agente ou administrador');
        }
        return this.prisma.chamado.update({
            where: { id },
            data: { responsavelId: dados.responsavelId },
            include: incluirPadrao,
        });
    }

    async adicionarComentario(id: number, usuario: UsuarioAutenticado, dados: CriarComentarioDto) {
        await this.buscarOuFalhar(id, usuario);
        await this.prisma.comentario.create({
            data: { chamadoId: id, autorId: usuario.id, mensagem: dados.mensagem },
        });
        return this.buscarOuFalhar(id, usuario);
    }

    // Chamado de outra pessoa responde 404, e não 403, para não revelar que o id existe (IDOR).
    private async buscarOuFalhar(id: number, usuario: UsuarioAutenticado) {
        const chamado = await this.prisma.chamado.findUnique({ where: { id }, include: incluirDetalhe });
        if (!chamado || (!this.ehEquipeSuporte(usuario.papel) && chamado.solicitanteId !== usuario.id)) {
            throw new NotFoundException('chamado não encontrado');
        }
        return chamado;
    }

    private podeEditar(chamado: Chamado, usuario: UsuarioAutenticado) {
        return this.ehEquipeSuporte(usuario.papel) || this.ehSolicitanteComChamadoAberto(chamado, usuario);
    }

    private podeExcluir(chamado: Chamado, usuario: UsuarioAutenticado) {
        return usuario.papel === Papel.ADMIN || this.ehSolicitanteComChamadoAberto(chamado, usuario);
    }

    private ehSolicitanteComChamadoAberto(chamado: Chamado, usuario: UsuarioAutenticado) {
        return chamado.solicitanteId === usuario.id && chamado.status === StatusChamado.ABERTO;
    }

    private ehEquipeSuporte(papel: Papel) {
        return papel === Papel.AGENTE || papel === Papel.ADMIN;
    }
}

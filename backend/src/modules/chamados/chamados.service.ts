import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Papel, Prisma } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { UsuarioAutenticado } from '../auth/auth.types';
import { AtualizarResponsavelDto } from './dto/atualizar-responsavel.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';

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
                titulo: dados.titulo.trim(),
                descricao: dados.descricao.trim(),
                prioridade: dados.prioridade,
                categoriaId: dados.categoriaId,
                solicitanteId: usuario.id,
            },
            include: incluirPadrao,
        });
    }

    listar(usuario: UsuarioAutenticado) {
        const where: Prisma.ChamadoWhereInput = this.ehEquipeSuporte(usuario.papel)
            ? {}
            : { solicitanteId: usuario.id };
        return this.prisma.chamado.findMany({
            where,
            include: incluirPadrao,
            orderBy: { criadoEm: 'desc' },
        });
    }

    buscarPorId(id: number, usuario: UsuarioAutenticado) {
        return this.buscarOuFalhar(id, usuario);
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
            data: { chamadoId: id, autorId: usuario.id, mensagem: dados.mensagem.trim() },
        });
        return this.buscarOuFalhar(id, usuario);
    }

    private async buscarOuFalhar(id: number, usuario: UsuarioAutenticado) {
        const chamado = await this.prisma.chamado.findUnique({ where: { id }, include: incluirDetalhe });
        if (!chamado) throw new NotFoundException('chamado não encontrado');
        if (!this.ehEquipeSuporte(usuario.papel) && chamado.solicitanteId !== usuario.id) {
            throw new ForbiddenException('acesso negado a este chamado');
        }
        return chamado;
    }

    private ehEquipeSuporte(papel: Papel) {
        return papel === Papel.AGENTE || papel === Papel.ADMIN;
    }
}

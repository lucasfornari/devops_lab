import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Papel, Prisma } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { gerarHashSenha } from '../../shared/seguranca/senha';
import { UsuarioAutenticado } from '../auth/auth.types';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';

const camposPublicos = { id: true, nome: true, email: true, papel: true } satisfies Prisma.UsuarioSelect;

@Injectable()
export class UsuariosService {
    constructor(private readonly prisma: PrismaService) {}

    async buscarPorId(id: number) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id }, select: camposPublicos });
        if (!usuario) throw new NotFoundException('usuário não encontrado');
        return usuario;
    }

    listar(filtros: ListarUsuariosDto = {}) {
        const where: Prisma.UsuarioWhereInput = { papel: filtros.papel };
        if (filtros.busca) {
            where.OR = [
                { nome: { contains: filtros.busca, mode: 'insensitive' } },
                { email: { contains: filtros.busca, mode: 'insensitive' } },
            ];
        }
        return this.prisma.usuario.findMany({ where, select: camposPublicos, orderBy: { nome: 'asc' } });
    }

    async criar(dados: CriarUsuarioDto) {
        await this.garantirEmailDisponivel(dados.email);
        return this.prisma.usuario.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                papel: dados.papel,
                senhaHash: await gerarHashSenha(dados.senha),
            },
            select: camposPublicos,
        });
    }

    async atualizar(id: number, dados: AtualizarUsuarioDto, admin: UsuarioAutenticado) {
        await this.buscarPorId(id);
        if (id === admin.id && dados.papel && dados.papel !== Papel.ADMIN) {
            throw new BadRequestException('você não pode remover o seu próprio acesso de administrador');
        }
        if (dados.email) {
            await this.garantirEmailDisponivel(dados.email, id);
        }

        return this.prisma.usuario.update({
            where: { id },
            data: {
                nome: dados.nome,
                email: dados.email,
                papel: dados.papel,
                senhaHash: dados.senha ? await gerarHashSenha(dados.senha) : undefined,
            },
            select: camposPublicos,
        });
    }

    async excluir(id: number, admin: UsuarioAutenticado) {
        if (id === admin.id) {
            throw new BadRequestException('você não pode excluir a sua própria conta');
        }

        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            select: { _count: { select: { chamadosAbertos: true, comentarios: true } } },
        });
        if (!usuario) throw new NotFoundException('usuário não encontrado');
        if (usuario._count.chamadosAbertos > 0 || usuario._count.comentarios > 0) {
            throw new ConflictException('usuário tem chamados ou comentários; altere o papel em vez de excluir');
        }

        await this.prisma.$transaction([
            this.prisma.chamado.updateMany({ where: { responsavelId: id }, data: { responsavelId: null } }),
            this.prisma.usuario.delete({ where: { id } }),
        ]);
    }

    private async garantirEmailDisponivel(email: string, idAtual?: number) {
        const existente = await this.prisma.usuario.findUnique({ where: { email } });
        if (existente && existente.id !== idAtual) {
            throw new ConflictException('já existe um usuário com este email');
        }
    }
}

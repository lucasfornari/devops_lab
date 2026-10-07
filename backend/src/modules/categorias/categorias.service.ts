import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { SalvarCategoriaDto } from './dto/salvar-categoria.dto';

@Injectable()
export class CategoriasService {
    constructor(private readonly prisma: PrismaService) {}

    listar() {
        return this.prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
    }

    async criar(dados: SalvarCategoriaDto) {
        await this.garantirNomeDisponivel(dados.nome);
        return this.prisma.categoria.create({ data: { nome: dados.nome } });
    }

    async atualizar(id: number, dados: SalvarCategoriaDto) {
        await this.buscarOuFalhar(id);
        await this.garantirNomeDisponivel(dados.nome, id);
        return this.prisma.categoria.update({ where: { id }, data: { nome: dados.nome } });
    }

    async excluir(id: number) {
        await this.buscarOuFalhar(id);
        await this.prisma.$transaction([
            this.prisma.chamado.updateMany({ where: { categoriaId: id }, data: { categoriaId: null } }),
            this.prisma.categoria.delete({ where: { id } }),
        ]);
    }

    private async buscarOuFalhar(id: number) {
        const categoria = await this.prisma.categoria.findUnique({ where: { id } });
        if (!categoria) throw new NotFoundException('categoria não encontrada');
        return categoria;
    }

    private async garantirNomeDisponivel(nome: string, idAtual?: number) {
        const existente = await this.prisma.categoria.findUnique({ where: { nome } });
        if (existente && existente.id !== idAtual) {
            throw new ConflictException('já existe uma categoria com este nome');
        }
    }
}

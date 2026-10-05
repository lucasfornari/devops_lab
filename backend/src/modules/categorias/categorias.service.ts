import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CriarCategoriaDto } from './dto/criar-categoria.dto';

@Injectable()
export class CategoriasService {
    constructor(private readonly prisma: PrismaService) {}

    listar() {
        return this.prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
    }

    async criar(dados: CriarCategoriaDto) {
        const nome = dados.nome.trim();
        const existente = await this.prisma.categoria.findUnique({ where: { nome } });
        if (existente) throw new ConflictException('já existe uma categoria com este nome');
        return this.prisma.categoria.create({ data: { nome } });
    }
}

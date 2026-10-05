import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsuariosService {
    private readonly camposPublicos = {
        id: true, nome: true, email: true, papel: true, criadoEm: true,
    } as const;

    constructor(private readonly prisma: PrismaService) {}

    async buscarPorId(id: number) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id }, select: this.camposPublicos });
        if (!usuario) throw new NotFoundException('usuário não encontrado');
        return usuario;
    }

    listar() {
        return this.prisma.usuario.findMany({ select: this.camposPublicos, orderBy: { nome: 'asc' } });
    }
}

import { BadRequestException, ConflictException } from '@nestjs/common';
import { Papel } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
    const prisma = {
        usuario: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
        chamado: { updateMany: jest.fn() },
        $transaction: jest.fn(),
    };
    const service = new UsuariosService(prisma as unknown as PrismaService);
    const admin = { id: 1, papel: Papel.ADMIN };

    beforeEach(() => jest.clearAllMocks());

    it('ADMIN não remove o próprio papel de administrador', async () => {
        prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
        await expect(service.atualizar(1, { papel: Papel.USUARIO }, admin)).rejects.toThrow(BadRequestException);
        expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    it('ADMIN não exclui a própria conta', async () => {
        await expect(service.excluir(1, admin)).rejects.toThrow(BadRequestException);
    });

    it('não exclui usuário que tem histórico de chamados', async () => {
        prisma.usuario.findUnique.mockResolvedValue({ _count: { chamadosAbertos: 2, comentarios: 0 } });
        await expect(service.excluir(5, admin)).rejects.toThrow(ConflictException);
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('exclui usuário sem histórico', async () => {
        prisma.usuario.findUnique.mockResolvedValue({ _count: { chamadosAbertos: 0, comentarios: 0 } });
        await service.excluir(5, admin);
        expect(prisma.$transaction).toHaveBeenCalled();
    });
});

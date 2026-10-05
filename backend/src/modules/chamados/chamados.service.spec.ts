import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Papel } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { ChamadosService } from './chamados.service';

describe('ChamadosService', () => {
    const prisma = {
        chamado: { findMany: jest.fn(), findUnique: jest.fn() },
    };
    const service = new ChamadosService(prisma as unknown as PrismaService);

    beforeEach(() => jest.clearAllMocks());

    it('USUARIO lista só os próprios chamados', async () => {
        prisma.chamado.findMany.mockResolvedValue([]);
        await service.listar({ id: 7, papel: Papel.USUARIO });
        expect(prisma.chamado.findMany.mock.calls[0][0].where).toEqual({ solicitanteId: 7 });
    });

    it('AGENTE lista todos os chamados', async () => {
        prisma.chamado.findMany.mockResolvedValue([]);
        await service.listar({ id: 7, papel: Papel.AGENTE });
        expect(prisma.chamado.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('USUARIO não acessa chamado de outra pessoa', async () => {
        prisma.chamado.findUnique.mockResolvedValue({ id: 1, solicitanteId: 99 });
        await expect(service.buscarPorId(1, { id: 7, papel: Papel.USUARIO })).rejects.toThrow(
            ForbiddenException,
        );
    });

    it('ADMIN acessa chamado de qualquer pessoa', async () => {
        prisma.chamado.findUnique.mockResolvedValue({ id: 1, solicitanteId: 99 });
        await expect(service.buscarPorId(1, { id: 7, papel: Papel.ADMIN })).resolves.toMatchObject({ id: 1 });
    });

    it('chamado inexistente gera 404', async () => {
        prisma.chamado.findUnique.mockResolvedValue(null);
        await expect(service.buscarPorId(1, { id: 7, papel: Papel.ADMIN })).rejects.toThrow(NotFoundException);
    });
});

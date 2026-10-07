import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Papel, PrioridadeChamado, StatusChamado } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { ChamadosService } from './chamados.service';

describe('ChamadosService', () => {
    const prisma = {
        chamado: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
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

    it('aplica os filtros sem perder o escopo do USUARIO', async () => {
        prisma.chamado.findMany.mockResolvedValue([]);
        await service.listar(
            { id: 7, papel: Papel.USUARIO },
            { status: StatusChamado.ABERTO, prioridade: PrioridadeChamado.ALTA, categoriaId: 2 },
        );
        expect(prisma.chamado.findMany.mock.calls[0][0].where).toEqual({
            solicitanteId: 7,
            status: StatusChamado.ABERTO,
            prioridade: PrioridadeChamado.ALTA,
            categoriaId: 2,
        });
    });

    it('busca texto no título ou na descrição', async () => {
        prisma.chamado.findMany.mockResolvedValue([]);
        await service.listar({ id: 7, papel: Papel.AGENTE }, { busca: 'impressora' });
        expect(prisma.chamado.findMany.mock.calls[0][0].where).toEqual({
            OR: [
                { titulo: { contains: 'impressora', mode: 'insensitive' } },
                { descricao: { contains: 'impressora', mode: 'insensitive' } },
            ],
        });
    });

    it('USUARIO recebe 404 ao acessar chamado de outra pessoa (IDOR)', async () => {
        prisma.chamado.findUnique.mockResolvedValue({ id: 1, solicitanteId: 99 });
        await expect(service.buscarPorId(1, { id: 7, papel: Papel.USUARIO })).rejects.toThrow(
            NotFoundException,
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

    describe('edição e exclusão', () => {
        const usuario = { id: 7, papel: Papel.USUARIO };
        const chamadoAberto = { id: 1, solicitanteId: 7, status: StatusChamado.ABERTO };
        const chamadoEmAndamento = { ...chamadoAberto, status: StatusChamado.EM_ANDAMENTO };

        it('solicitante edita o próprio chamado aberto', async () => {
            prisma.chamado.findUnique.mockResolvedValue(chamadoAberto);
            await service.atualizar(1, usuario, { titulo: 'novo' });
            expect(prisma.chamado.update).toHaveBeenCalled();
        });

        it('solicitante não edita chamado que já está em andamento', async () => {
            prisma.chamado.findUnique.mockResolvedValue(chamadoEmAndamento);
            await expect(service.atualizar(1, usuario, { titulo: 'novo' })).rejects.toThrow(ForbiddenException);
        });

        it('AGENTE edita chamado em andamento', async () => {
            prisma.chamado.findUnique.mockResolvedValue(chamadoEmAndamento);
            await service.atualizar(1, { id: 3, papel: Papel.AGENTE }, { titulo: 'novo' });
            expect(prisma.chamado.update).toHaveBeenCalled();
        });

        it('AGENTE não exclui chamado de outra pessoa', async () => {
            prisma.chamado.findUnique.mockResolvedValue(chamadoAberto);
            await expect(service.excluir(1, { id: 3, papel: Papel.AGENTE })).rejects.toThrow(ForbiddenException);
            expect(prisma.chamado.delete).not.toHaveBeenCalled();
        });

        it('ADMIN exclui qualquer chamado', async () => {
            prisma.chamado.findUnique.mockResolvedValue(chamadoEmAndamento);
            await service.excluir(1, { id: 1, papel: Papel.ADMIN });
            expect(prisma.chamado.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    it('AGENTE não atribui chamado a outra pessoa', async () => {
        prisma.chamado.findUnique.mockResolvedValue({ id: 1, solicitanteId: 7 });
        await expect(
            service.atualizarResponsavel(1, { id: 3, papel: Papel.AGENTE }, { responsavelId: 4 }),
        ).rejects.toThrow(ForbiddenException);
    });
});

import { Router } from 'express';
import { Papel } from '@prisma/client';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { validate } from '../../shared/middlewares/validate';
import { autenticar, autorizar } from '../auth/auth.middleware';
import {
    atualizarResponsavelSchema,
    atualizarStatusSchema,
    criarChamadoSchema,
    criarComentarioSchema,
} from './chamados.schemas';
import {
    adicionarComentarioController,
    atualizarResponsavelController,
    atualizarStatusController,
    buscarPorIdController,
    criarController,
    listarController,
} from './chamados.controller';

export const chamadosRouter = Router();

chamadosRouter.use(autenticar);

chamadosRouter.post('/', validate(criarChamadoSchema), asyncHandler(criarController));
chamadosRouter.get('/', asyncHandler(listarController));
chamadosRouter.get('/:id', asyncHandler(buscarPorIdController));
chamadosRouter.patch(
    '/:id/status',
    autorizar(Papel.AGENTE, Papel.ADMIN),
    validate(atualizarStatusSchema),
    asyncHandler(atualizarStatusController)
);
chamadosRouter.patch(
    '/:id/responsavel',
    autorizar(Papel.AGENTE, Papel.ADMIN),
    validate(atualizarResponsavelSchema),
    asyncHandler(atualizarResponsavelController)
);
chamadosRouter.post(
    '/:id/comentarios',
    validate(criarComentarioSchema),
    asyncHandler(adicionarComentarioController)
);

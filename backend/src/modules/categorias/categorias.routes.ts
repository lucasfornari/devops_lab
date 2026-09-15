import { Router } from 'express';
import { Papel } from '@prisma/client';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { validate } from '../../shared/middlewares/validate';
import { autenticar, autorizar } from '../auth/auth.middleware';
import { criarCategoriaSchema } from './categorias.schemas';
import { criarController, listarController } from './categorias.controller';

export const categoriasRouter = Router();

categoriasRouter.get('/', autenticar, asyncHandler(listarController));
categoriasRouter.post(
    '/',
    autenticar,
    autorizar(Papel.ADMIN),
    validate(criarCategoriaSchema),
    asyncHandler(criarController)
);

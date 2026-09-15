import { Router } from 'express';
import { Papel } from '@prisma/client';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { autenticar, autorizar } from '../auth/auth.middleware';
import { listarController, meController } from './usuarios.controller';

export const usuariosRouter = Router();

usuariosRouter.get('/me', autenticar, asyncHandler(meController));
usuariosRouter.get('/', autenticar, autorizar(Papel.ADMIN), asyncHandler(listarController));

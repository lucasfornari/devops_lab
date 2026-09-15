import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { validate } from '../../shared/middlewares/validate';
import { loginSchema, registrarSchema } from './auth.schemas';
import { loginController, registrarController } from './auth.controller';

export const authRouter = Router();

authRouter.post('/registrar', validate(registrarSchema), asyncHandler(registrarController));
authRouter.post('/login', validate(loginSchema), asyncHandler(loginController));

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { Papel } from '@prisma/client';

export interface UsuarioAutenticado {
    id: number;
    papel: Papel;
}

declare global {
    namespace Express {
        interface Request {
            usuario?: UsuarioAutenticado;
        }
    }
}

export function autenticar(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        next(new AppError('token de autenticação ausente', 401));
        return;
    }

    const token = header.slice('Bearer '.length);
    try {
        const payload = jwt.verify(token, env.jwtSecret) as UsuarioAutenticado;
        req.usuario = { id: payload.id, papel: payload.papel };
        next();
    } catch {
        next(new AppError('token de autenticação inválido', 401));
    }
}

export function autorizar(...papeis: Papel[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.usuario || !papeis.includes(req.usuario.papel)) {
            next(new AppError('acesso negado para este papel', 403));
            return;
        }
        next();
    };
}

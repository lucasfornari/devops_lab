import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ status: 'error', message: err.message });
        return;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
            res.status(404).json({ status: 'error', message: 'registro não encontrado' });
            return;
        }
        if (err.code === 'P2002') {
            res.status(409).json({ status: 'error', message: 'registro já existe' });
            return;
        }
    }

    console.error(err);
    res.status(500).json({ status: 'error', message: 'erro interno do servidor' });
}

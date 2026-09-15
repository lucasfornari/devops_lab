import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { AppError } from '../errors/AppError';

export function validate(schema: ZodType) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const mensagem = err.issues.map((issue) => issue.message).join('; ');
                next(new AppError(mensagem, 400));
                return;
            }
            next(err);
        }
    };
}

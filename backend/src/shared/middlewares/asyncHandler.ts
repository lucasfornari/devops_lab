import { NextFunction, Request, Response } from 'express';

type RequestHandlerAsync = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: RequestHandlerAsync) {
    return (req: Request, res: Response, next: NextFunction): void => {
        handler(req, res, next).catch(next);
    };
}

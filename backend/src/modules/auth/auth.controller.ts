import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function registrarController(req: Request, res: Response): Promise<void> {
    const resultado = await authService.registrar(req.body);
    res.status(201).json(resultado);
}

export async function loginController(req: Request, res: Response): Promise<void> {
    const resultado = await authService.login(req.body);
    res.status(200).json(resultado);
}

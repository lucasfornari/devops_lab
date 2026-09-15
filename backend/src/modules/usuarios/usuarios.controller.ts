import { Request, Response } from 'express';
import * as usuariosService from './usuarios.service';

export async function meController(req: Request, res: Response): Promise<void> {
    const usuario = await usuariosService.buscarPorId(req.usuario!.id);
    res.status(200).json(usuario);
}

export async function listarController(_req: Request, res: Response): Promise<void> {
    const usuarios = await usuariosService.listar();
    res.status(200).json(usuarios);
}

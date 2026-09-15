import { Request, Response } from 'express';
import * as categoriasService from './categorias.service';

export async function listarController(_req: Request, res: Response): Promise<void> {
    const categorias = await categoriasService.listar();
    res.status(200).json(categorias);
}

export async function criarController(req: Request, res: Response): Promise<void> {
    const categoria = await categoriasService.criar(req.body);
    res.status(201).json(categoria);
}

import { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import * as chamadosService from './chamados.service';

function idDaRota(req: Request): number {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('id de chamado inválido', 400);
    }
    return id;
}

export async function criarController(req: Request, res: Response): Promise<void> {
    const chamado = await chamadosService.criar(req.usuario!, req.body);
    res.status(201).json(chamado);
}

export async function listarController(req: Request, res: Response): Promise<void> {
    const chamados = await chamadosService.listar(req.usuario!);
    res.status(200).json(chamados);
}

export async function buscarPorIdController(req: Request, res: Response): Promise<void> {
    const chamado = await chamadosService.buscarPorId(idDaRota(req), req.usuario!);
    res.status(200).json(chamado);
}

export async function atualizarStatusController(req: Request, res: Response): Promise<void> {
    const chamado = await chamadosService.atualizarStatus(idDaRota(req), req.usuario!, req.body);
    res.status(200).json(chamado);
}

export async function atualizarResponsavelController(req: Request, res: Response): Promise<void> {
    const chamado = await chamadosService.atualizarResponsavel(idDaRota(req), req.usuario!, req.body);
    res.status(200).json(chamado);
}

export async function adicionarComentarioController(req: Request, res: Response): Promise<void> {
    const chamado = await chamadosService.adicionarComentario(idDaRota(req), req.usuario!, req.body);
    res.status(201).json(chamado);
}

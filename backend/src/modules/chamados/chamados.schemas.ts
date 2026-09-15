import { z } from 'zod';
import { PrioridadeChamado, StatusChamado } from '@prisma/client';

export const criarChamadoSchema = z.object({
    titulo: z.string().trim().min(1, 'título é obrigatório').max(150),
    descricao: z.string().trim().min(1, 'descrição é obrigatória').max(4000),
    prioridade: z.nativeEnum(PrioridadeChamado).optional(),
    categoriaId: z.number().int().positive().optional(),
});

export const atualizarStatusSchema = z.object({
    status: z.nativeEnum(StatusChamado),
});

export const atualizarResponsavelSchema = z.object({
    responsavelId: z.number().int().positive(),
});

export const criarComentarioSchema = z.object({
    mensagem: z.string().trim().min(1, 'mensagem é obrigatória').max(2000),
});

export type CriarChamadoInput = z.infer<typeof criarChamadoSchema>;
export type AtualizarStatusInput = z.infer<typeof atualizarStatusSchema>;
export type AtualizarResponsavelInput = z.infer<typeof atualizarResponsavelSchema>;
export type CriarComentarioInput = z.infer<typeof criarComentarioSchema>;

import { z } from 'zod';

export const criarCategoriaSchema = z.object({
    nome: z.string().trim().min(1, 'nome é obrigatório').max(80),
});

export type CriarCategoriaInput = z.infer<typeof criarCategoriaSchema>;

import { z } from 'zod';

export const registrarSchema = z.object({
    nome: z.string().trim().min(1, 'nome é obrigatório').max(120),
    email: z.string().trim().email('email inválido').max(160),
    senha: z.string().min(6, 'senha deve ter ao menos 6 caracteres').max(72),
});

export const loginSchema = z.object({
    email: z.string().trim().email('email inválido'),
    senha: z.string().min(1, 'senha é obrigatória'),
});

export type RegistrarInput = z.infer<typeof registrarSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

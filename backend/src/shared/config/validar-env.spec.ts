import { validarEnv } from './validar-env';

describe('validarEnv', () => {
    it('aceita quando as variáveis obrigatórias existem', () => {
        const env = { DATABASE_URL: 'postgresql://x', JWT_SECRET: 'segredo' };
        expect(validarEnv(env)).toBe(env);
    });

    it('falha listando o que está faltando', () => {
        expect(() => validarEnv({ DATABASE_URL: 'postgresql://x' })).toThrow('JWT_SECRET');
    });
});

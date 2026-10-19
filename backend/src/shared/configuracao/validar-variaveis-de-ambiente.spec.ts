import { validarVariaveisDeAmbiente } from './validar-variaveis-de-ambiente';

describe('validarVariaveisDeAmbiente', () => {
    it('aceita quando as variáveis obrigatórias existem', () => {
        const variaveis = { DATABASE_URL: 'postgresql://x', JWT_SECRET: 'segredo' };
        expect(validarVariaveisDeAmbiente(variaveis)).toBe(variaveis);
    });

    it('falha listando o que está faltando', () => {
        expect(() => validarVariaveisDeAmbiente({ DATABASE_URL: 'postgresql://x' })).toThrow('JWT_SECRET');
    });
});

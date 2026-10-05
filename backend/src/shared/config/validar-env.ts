const obrigatorias = ['DATABASE_URL', 'JWT_SECRET'];

export function validarEnv(env: Record<string, unknown>): Record<string, unknown> {
    const faltando = obrigatorias.filter((nome) => !env[nome]);
    if (faltando.length > 0) {
        throw new Error(`variáveis de ambiente obrigatórias ausentes: ${faltando.join(', ')}`);
    }
    return env;
}

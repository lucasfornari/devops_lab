const variaveisObrigatorias = ['DATABASE_URL', 'JWT_SECRET'];

export function validarVariaveisDeAmbiente(variaveis: Record<string, unknown>): Record<string, unknown> {
    const faltando = variaveisObrigatorias.filter((nome) => !variaveis[nome]);
    if (faltando.length > 0) {
        throw new Error(`variáveis de ambiente obrigatórias ausentes: ${faltando.join(', ')}`);
    }
    return variaveis;
}

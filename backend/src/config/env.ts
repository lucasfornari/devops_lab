import 'dotenv/config';

function obrigatoria(nome: string): string {
    const valor = process.env[nome];
    if (!valor) {
        throw new Error(`variável de ambiente obrigatória ausente: ${nome}`);
    }
    return valor;
}

export const env = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: obrigatoria('JWT_SECRET'),
    databaseUrl: obrigatoria('DATABASE_URL'),
};

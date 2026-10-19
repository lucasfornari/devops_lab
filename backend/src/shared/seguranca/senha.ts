import * as bcrypt from 'bcryptjs';

const CUSTO_DO_HASH = 10;

export const TAMANHO_MINIMO_SENHA = 6;
export const TAMANHO_MAXIMO_SENHA = 72;

export function senhaTemTamanhoValido(senha: string) {
    return senha.length >= TAMANHO_MINIMO_SENHA && senha.length <= TAMANHO_MAXIMO_SENHA;
}

export function gerarHashSenha(senha: string) {
    return bcrypt.hash(senha, CUSTO_DO_HASH);
}

export function compararSenha(senha: string, hash: string) {
    return bcrypt.compare(senha, hash);
}

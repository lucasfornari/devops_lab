const CHAVE_TOKEN = 'chamados.token'

export function obterToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN)
  } catch {
    return null
  }
}

export function definirToken(token: string): void {
  try {
    localStorage.setItem(CHAVE_TOKEN, token)
  } catch {
    // localStorage indisponível (modo privado, storage bloqueado) — segue só em memória
  }
}

export function limparToken(): void {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
  } catch {
    // ignora
  }
}

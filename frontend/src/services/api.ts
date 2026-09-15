import { obterToken } from './token'

interface ErroApi {
  status: string
  message: string
}

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = obterToken()
  const headers = new Headers(opcoes.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const resposta = await fetch(`/api${caminho}`, { ...opcoes, headers })

  if (resposta.status === 204) {
    return undefined as T
  }

  const corpo = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    const mensagem = (corpo as ErroApi | null)?.message ?? `erro ${resposta.status}`
    throw new Error(mensagem)
  }

  return corpo as T
}

export const api = {
  get: <T>(caminho: string) => requisitar<T>(caminho),
  post: <T>(caminho: string, dados?: unknown) =>
    requisitar<T>(caminho, { method: 'POST', body: dados ? JSON.stringify(dados) : undefined }),
  patch: <T>(caminho: string, dados?: unknown) =>
    requisitar<T>(caminho, { method: 'PATCH', body: dados ? JSON.stringify(dados) : undefined }),
}

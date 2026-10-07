import { limparToken, obterToken } from './token'

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

  if (resposta.status === 401 && token) {
    limparToken()
    window.location.assign('/login')
  }

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

type Query = Record<string, string | number | undefined>

function comQuery(caminho: string, query: Query = {}): string {
  const parametros = new URLSearchParams()
  for (const [chave, valor] of Object.entries(query)) {
    if (valor !== undefined && valor !== '') parametros.set(chave, String(valor))
  }
  const texto = parametros.toString()
  return texto ? `${caminho}?${texto}` : caminho
}

export const api = {
  get: <T>(caminho: string, query?: Query) => requisitar<T>(comQuery(caminho, query)),
  post: <T>(caminho: string, dados?: unknown) =>
    requisitar<T>(caminho, { method: 'POST', body: dados ? JSON.stringify(dados) : undefined }),
  patch: <T>(caminho: string, dados?: unknown) =>
    requisitar<T>(caminho, { method: 'PATCH', body: dados ? JSON.stringify(dados) : undefined }),
  delete: (caminho: string) => requisitar<void>(caminho, { method: 'DELETE' }),
}

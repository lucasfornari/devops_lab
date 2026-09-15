export type Papel = 'USUARIO' | 'AGENTE' | 'ADMIN'
export type StatusChamado = 'ABERTO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'FECHADO'
export type PrioridadeChamado = 'BAIXA' | 'MEDIA' | 'ALTA'

export interface Usuario {
  id: number
  nome: string
  email: string
  papel: Papel
}

export interface Categoria {
  id: number
  nome: string
}

export interface Comentario {
  id: number
  mensagem: string
  criadoEm: string
  autor: Usuario
}

export interface Chamado {
  id: number
  titulo: string
  descricao: string
  status: StatusChamado
  prioridade: PrioridadeChamado
  criadoEm: string
  atualizadoEm: string
  categoria: Categoria | null
  solicitante: Usuario
  responsavel: Usuario | null
  comentarios?: Comentario[]
}

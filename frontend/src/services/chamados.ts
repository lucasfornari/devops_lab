import { api } from './api'
import type { Categoria, Chamado, PrioridadeChamado, StatusChamado } from '@/types'

export function listarChamados() {
  return api.get<Chamado[]>('/chamados')
}

export function buscarChamado(id: number) {
  return api.get<Chamado>(`/chamados/${id}`)
}

export function criarChamado(dados: { titulo: string; descricao: string; categoriaId?: number; prioridade?: PrioridadeChamado }) {
  return api.post<Chamado>('/chamados', dados)
}

export function atualizarStatusChamado(id: number, status: StatusChamado) {
  return api.patch<Chamado>(`/chamados/${id}/status`, { status })
}

export function atualizarResponsavelChamado(id: number, responsavelId: number) {
  return api.patch<Chamado>(`/chamados/${id}/responsavel`, { responsavelId })
}

export function adicionarComentario(id: number, mensagem: string) {
  return api.post<Chamado>(`/chamados/${id}/comentarios`, { mensagem })
}

export function listarCategorias() {
  return api.get<Categoria[]>('/categorias')
}

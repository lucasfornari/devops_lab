import { api } from './api'
import type { Chamado, EdicaoChamado, FiltrosChamados, NovoChamado, StatusChamado } from '@/types'

export function listarChamados(filtros: FiltrosChamados = {}) {
  return api.get<Chamado[]>('/chamados', filtros)
}

export function buscarChamado(id: number) {
  return api.get<Chamado>(`/chamados/${id}`)
}

export function criarChamado(dados: NovoChamado) {
  return api.post<Chamado>('/chamados', dados)
}

export function atualizarChamado(id: number, dados: EdicaoChamado) {
  return api.patch<Chamado>(`/chamados/${id}`, dados)
}

export function excluirChamado(id: number) {
  return api.delete(`/chamados/${id}`)
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

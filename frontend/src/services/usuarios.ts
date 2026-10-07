import { api } from './api'
import type { EdicaoUsuario, FiltrosUsuarios, NovoUsuario, Usuario } from '@/types'

export function listarUsuarios(filtros: FiltrosUsuarios = {}) {
  return api.get<Usuario[]>('/usuarios', filtros)
}

export function criarUsuario(dados: NovoUsuario) {
  return api.post<Usuario>('/usuarios', dados)
}

export function atualizarUsuario(id: number, dados: EdicaoUsuario) {
  return api.patch<Usuario>(`/usuarios/${id}`, dados)
}

export function excluirUsuario(id: number) {
  return api.delete(`/usuarios/${id}`)
}

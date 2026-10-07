import { api } from './api'
import type { Categoria, DadosCategoria } from '@/types'

export function listarCategorias() {
  return api.get<Categoria[]>('/categorias')
}

export function criarCategoria(dados: DadosCategoria) {
  return api.post<Categoria>('/categorias', dados)
}

export function atualizarCategoria(id: number, dados: DadosCategoria) {
  return api.patch<Categoria>(`/categorias/${id}`, dados)
}

export function excluirCategoria(id: number) {
  return api.delete(`/categorias/${id}`)
}

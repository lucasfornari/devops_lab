import type { components } from './api'

type Schemas = components['schemas']

export type Papel = Schemas['Papel']
export type StatusChamado = Schemas['StatusChamado']
export type PrioridadeChamado = Schemas['PrioridadeChamado']
export type Usuario = Schemas['UsuarioDto']
export type Categoria = Schemas['CategoriaDto']
export type Comentario = Schemas['ComentarioDto']
export type Chamado = Schemas['ChamadoDto']
export type AuthResposta = Schemas['AuthRespostaDto']
export type NovoChamado = Schemas['CriarChamadoDto']

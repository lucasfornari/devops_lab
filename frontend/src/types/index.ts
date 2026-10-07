import type { components, operations } from './api'

type Schemas = components['schemas']
type QueryDe<Operacao extends keyof operations> = NonNullable<operations[Operacao]['parameters']['query']>

export type Papel = Schemas['Papel']
export type StatusChamado = Schemas['StatusChamado']
export type PrioridadeChamado = Schemas['PrioridadeChamado']
export type FiltroAtribuicao = Schemas['FiltroAtribuicao']

export type Usuario = Schemas['UsuarioDto']
export type Categoria = Schemas['CategoriaDto']
export type Comentario = Schemas['ComentarioDto']
export type Chamado = Schemas['ChamadoDto']
export type AuthResposta = Schemas['AuthRespostaDto']

export type NovoChamado = Schemas['CriarChamadoDto']
export type EdicaoChamado = Schemas['AtualizarChamadoDto']
export type DadosCategoria = Schemas['SalvarCategoriaDto']
export type NovoUsuario = Schemas['CriarUsuarioDto']
export type EdicaoUsuario = Schemas['AtualizarUsuarioDto']

export type FiltrosChamados = QueryDe<'ChamadosController_listar'>
export type FiltrosUsuarios = QueryDe<'UsuariosController_listar'>

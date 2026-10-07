import type { Chamado, Usuario } from '@/types'

export function ehEquipeSuporte(usuario: Usuario | null): boolean {
  return usuario?.papel === 'AGENTE' || usuario?.papel === 'ADMIN'
}

function ehSolicitanteComChamadoAberto(chamado: Chamado, usuario: Usuario | null): boolean {
  return chamado.solicitante.id === usuario?.id && chamado.status === 'ABERTO'
}

export function podeEditarChamado(chamado: Chamado, usuario: Usuario | null): boolean {
  return ehEquipeSuporte(usuario) || ehSolicitanteComChamadoAberto(chamado, usuario)
}

export function podeExcluirChamado(chamado: Chamado, usuario: Usuario | null): boolean {
  return usuario?.papel === 'ADMIN' || ehSolicitanteComChamadoAberto(chamado, usuario)
}

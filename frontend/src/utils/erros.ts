export function mensagemDeErro(erro: unknown, padrao: string): string {
  return erro instanceof Error ? erro.message : padrao
}

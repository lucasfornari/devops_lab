import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { definirToken, limparToken, obterToken } from '@/services/token'
import type { AuthResposta, Usuario } from '@/types'
import { ehEquipeSuporte as verificarEquipeSuporte } from '@/utils/permissoes'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(obterToken())
  const usuario = ref<Usuario | null>(null)

  const estaAutenticado = computed(() => !!token.value)
  const ehAdmin = computed(() => usuario.value?.papel === 'ADMIN')
  const ehEquipeSuporte = computed(() => verificarEquipeSuporte(usuario.value))

  function aplicarSessao(resposta: AuthResposta) {
    token.value = resposta.token
    usuario.value = resposta.usuario
    definirToken(resposta.token)
  }

  async function login(email: string, senha: string) {
    const resposta = await api.post<AuthResposta>('/auth/login', { email, senha })
    aplicarSessao(resposta)
  }

  async function registrar(nome: string, email: string, senha: string) {
    const resposta = await api.post<AuthResposta>('/auth/registrar', { nome, email, senha })
    aplicarSessao(resposta)
  }

  async function carregarUsuarioAtual() {
    if (!token.value) return
    usuario.value = await api.get<Usuario>('/usuarios/me')
  }

  function logout() {
    token.value = null
    usuario.value = null
    limparToken()
  }

  return {
    token,
    usuario,
    estaAutenticado,
    ehAdmin,
    ehEquipeSuporte,
    login,
    registrar,
    logout,
    carregarUsuarioAtual,
  }
})

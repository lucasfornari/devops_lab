import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { definirToken, limparToken, obterToken } from '@/services/token'
import type { Usuario } from '@/types'

interface RespostaAuth {
  token: string
  usuario: Usuario
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(obterToken())
  const usuario = ref<Usuario | null>(null)

  const estaAutenticado = computed(() => !!token.value)

  function aplicarSessao(resposta: RespostaAuth) {
    token.value = resposta.token
    usuario.value = resposta.usuario
    definirToken(resposta.token)
  }

  async function login(email: string, senha: string) {
    const resposta = await api.post<RespostaAuth>('/auth/login', { email, senha })
    aplicarSessao(resposta)
  }

  async function registrar(nome: string, email: string, senha: string) {
    const resposta = await api.post<RespostaAuth>('/auth/registrar', { nome, email, senha })
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

  return { token, usuario, estaAutenticado, login, registrar, logout, carregarUsuarioAtual }
})

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AlertError from '@/components/AlertError.vue'

const auth = useAuthStore()
const router = useRouter()

const modoRegistro = ref(false)
const nome = ref('')
const email = ref('')
const senha = ref('')
const carregando = ref(false)
const erro = ref('')

async function enviar() {
  erro.value = ''
  carregando.value = true
  try {
    if (modoRegistro.value) {
      await auth.registrar(nome.value, email.value, senha.value)
    } else {
      await auth.login(email.value, senha.value)
    }
    router.push('/')
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'não foi possível autenticar'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <form class="card flex w-full max-w-sm flex-col gap-3" @submit.prevent="enviar">
      <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ modoRegistro ? 'Criar conta' : 'Entrar' }}
      </h1>

      <label v-if="modoRegistro" class="form-label">
        Nome
        <input v-model="nome" type="text" required maxlength="120" class="form-control" />
      </label>

      <label class="form-label">
        Email
        <input v-model="email" type="email" required maxlength="160" class="form-control" />
      </label>

      <label class="form-label">
        Senha
        <input v-model="senha" type="password" required minlength="6" maxlength="72" class="form-control" />
      </label>

      <AlertError v-if="erro" :mensagem="erro" />

      <button type="submit" class="btn-primary" :disabled="carregando">
        {{ carregando ? 'Enviando...' : modoRegistro ? 'Registrar' : 'Entrar' }}
      </button>

      <button type="button" class="btn-ghost self-center text-sm" @click="modoRegistro = !modoRegistro">
        {{ modoRegistro ? 'Já tenho conta' : 'Criar uma conta' }}
      </button>
    </form>
  </div>
</template>

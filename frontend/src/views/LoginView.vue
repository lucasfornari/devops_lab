<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
  <div class="pagina-login">
    <form class="cartao" @submit.prevent="enviar">
      <h1>{{ modoRegistro ? 'Criar conta' : 'Entrar' }}</h1>

      <label v-if="modoRegistro">
        Nome
        <input v-model="nome" type="text" required maxlength="120" />
      </label>

      <label>
        Email
        <input v-model="email" type="email" required maxlength="160" />
      </label>

      <label>
        Senha
        <input v-model="senha" type="password" required minlength="6" maxlength="72" />
      </label>

      <p v-if="erro" class="erro">{{ erro }}</p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Enviando...' : modoRegistro ? 'Registrar' : 'Entrar' }}
      </button>

      <button type="button" class="link" @click="modoRegistro = !modoRegistro">
        {{ modoRegistro ? 'Já tenho conta' : 'Criar uma conta' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.pagina-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.cartao {
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 1rem;
}

button {
  padding: 0.6rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

button[type='submit'] {
  background: #2563eb;
  color: white;
  font-weight: 600;
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: default;
}

button.link {
  background: transparent;
  color: #2563eb;
  font-size: 0.875rem;
}

.erro {
  color: #dc2626;
  font-size: 0.875rem;
}
</style>

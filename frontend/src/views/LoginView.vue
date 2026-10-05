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
  <div class="row justify-content-center pt-md-5">
    <div class="col-12 col-sm-10 col-md-7">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h4 text-center mb-4">{{ modoRegistro ? 'Criar conta' : 'Entrar' }}</h1>

          <form class="d-flex flex-column gap-3" @submit.prevent="enviar">
            <div v-if="modoRegistro">
              <label for="nome" class="form-label">Nome</label>
              <input id="nome" v-model="nome" type="text" required maxlength="120" class="form-control" />
            </div>

            <div>
              <label for="email" class="form-label">Email</label>
              <input id="email" v-model="email" type="email" required maxlength="160" class="form-control" />
            </div>

            <div>
              <label for="senha" class="form-label">Senha</label>
              <input
                id="senha"
                v-model="senha"
                type="password"
                required
                minlength="6"
                maxlength="72"
                class="form-control"
              />
            </div>

            <AlertError v-if="erro" :mensagem="erro" />

            <button type="submit" class="btn btn-primary w-100" :disabled="carregando">
              {{ carregando ? 'Enviando...' : modoRegistro ? 'Registrar' : 'Entrar' }}
            </button>

            <button type="button" class="btn btn-link" @click="modoRegistro = !modoRegistro">
              {{ modoRegistro ? 'Já tenho conta' : 'Criar uma conta' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

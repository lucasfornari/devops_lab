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
  <div class="row justify-content-center py-md-5">
    <div class="col-12 col-sm-10 col-md-7 col-lg-5">
      <div class="text-center mb-4">
        <span class="icone-marca bg-primary text-white fs-3 mb-3" style="width: 3.5rem; height: 3.5rem">
          <i class="bi bi-headset"></i>
        </span>
        <h1 class="h3 fw-bold mb-1">Central de Chamados</h1>
        <p class="text-body-secondary mb-0">Abra e acompanhe seus chamados de suporte</p>
      </div>

      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <div class="nav nav-pills nav-fill bg-body-tertiary rounded-pill p-1 mb-4">
            <button
              type="button"
              class="nav-link rounded-pill"
              :class="{ active: !modoRegistro }"
              @click="modoRegistro = false"
            >
              Entrar
            </button>
            <button
              type="button"
              class="nav-link rounded-pill"
              :class="{ active: modoRegistro }"
              @click="modoRegistro = true"
            >
              Criar conta
            </button>
          </div>

          <form class="d-flex flex-column gap-3" @submit.prevent="enviar">
            <div v-if="modoRegistro">
              <label for="nome" class="form-label small fw-semibold">Nome</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
                <input id="nome" v-model="nome" type="text" required maxlength="120" class="form-control" />
              </div>
            </div>

            <div>
              <label for="email" class="form-label small fw-semibold">Email</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input id="email" v-model="email" type="email" required maxlength="160" class="form-control" />
              </div>
            </div>

            <div>
              <label for="senha" class="form-label small fw-semibold">Senha</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
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
            </div>

            <AlertError v-if="erro" :mensagem="erro" />

            <button type="submit" class="btn btn-primary btn-lg rounded-pill mt-2" :disabled="carregando">
              {{ carregando ? 'Enviando...' : modoRegistro ? 'Criar conta' : 'Entrar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

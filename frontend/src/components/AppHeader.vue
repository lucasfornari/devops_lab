<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const menuAberto = ref(false)

function ir(caminho: string) {
  menuAberto.value = false
  router.push(caminho)
}

function sair() {
  auth.logout()
  ir('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-md bg-primary" data-bs-theme="dark">
    <div class="container">
      <button type="button" class="navbar-brand border-0 bg-transparent fw-semibold" @click="ir('/')">
        Chamados
      </button>
      <button
        type="button"
        class="navbar-toggler"
        aria-label="Abrir menu"
        :aria-expanded="menuAberto"
        @click="menuAberto = !menuAberto"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" :class="{ show: menuAberto }">
        <div class="d-flex flex-column flex-md-row align-items-md-center gap-2 ms-md-auto py-2 py-md-0">
          <span v-if="auth.usuario" class="navbar-text me-md-2">
            {{ auth.usuario.nome }}
            <span class="badge text-bg-light ms-1">{{ auth.usuario.papel }}</span>
          </span>
          <button type="button" class="btn btn-light btn-sm" @click="ir('/')">Lista</button>
          <button type="button" class="btn btn-light btn-sm" @click="ir('/chamados/novo')">Novo chamado</button>
          <button type="button" class="btn btn-outline-light btn-sm" @click="sair">Sair</button>
        </div>
      </div>
    </div>
  </nav>
</template>

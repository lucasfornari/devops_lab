<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AvatarIniciais from '@/components/AvatarIniciais.vue'

const auth = useAuthStore()
const router = useRouter()
const menuAberto = ref(false)
const usuarioAberto = ref(false)

function ir(caminho: string) {
  menuAberto.value = false
  usuarioAberto.value = false
  router.push(caminho)
}

function sair() {
  auth.logout()
  ir('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-md bg-body border-bottom shadow-sm sticky-top py-2">
    <div class="container">
      <button
        type="button"
        class="navbar-brand btn btn-link text-body text-decoration-none d-flex align-items-center gap-2 p-0"
        @click="ir('/')"
      >
        <span class="icone-marca bg-primary text-white"><i class="bi bi-headset"></i></span>
        <span class="fw-bold">Central de Chamados</span>
      </button>

      <button
        type="button"
        class="navbar-toggler border-0 shadow-none"
        aria-label="Abrir menu"
        :aria-expanded="menuAberto"
        @click="menuAberto = !menuAberto"
      >
        <i class="bi fs-4" :class="menuAberto ? 'bi-x-lg' : 'bi-list'"></i>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: menuAberto }">
        <div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 ms-md-auto pt-3 pt-md-0">
          <button type="button" class="btn btn-link text-body text-decoration-none" @click="ir('/')">
            <i class="bi bi-grid me-1"></i> Chamados
          </button>
          <button type="button" class="btn btn-primary rounded-pill px-3" @click="ir('/chamados/novo')">
            <i class="bi bi-plus-lg me-1"></i> Novo chamado
          </button>

          <div v-if="auth.usuario" class="dropdown">
            <button
              type="button"
              class="btn btn-link text-body text-decoration-none d-flex align-items-center gap-2 w-100"
              :aria-expanded="usuarioAberto"
              @click="usuarioAberto = !usuarioAberto"
            >
              <AvatarIniciais :nome="auth.usuario.nome" :tamanho="34" />
              <span class="text-start lh-sm">
                <span class="d-block small fw-semibold">{{ auth.usuario.nome }}</span>
                <span class="d-block small text-body-secondary">{{ auth.usuario.papel }}</span>
              </span>
              <i class="bi bi-chevron-down small ms-auto ms-md-1"></i>
            </button>
            <div
              class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3"
              data-bs-popper="static"
              :class="{ show: usuarioAberto }"
            >
              <span class="dropdown-item-text small text-body-secondary">{{ auth.usuario.email }}</span>
              <hr class="dropdown-divider" />
              <button type="button" class="dropdown-item text-danger" @click="sair">
                <i class="bi bi-box-arrow-right me-2"></i>Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

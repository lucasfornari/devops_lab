<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const abas = [
  { nome: 'admin-categorias', rotulo: 'Categorias', icone: 'bi-tags' },
  { nome: 'admin-usuarios', rotulo: 'Usuários', icone: 'bi-people' },
] as const
</script>

<template>
  <div class="d-flex align-items-center gap-3 mb-4">
    <span class="icone-redondo bg-primary-subtle text-primary-emphasis fs-4" style="width: 3rem; height: 3rem">
      <i class="bi bi-gear"></i>
    </span>
    <div>
      <h1 class="h3 fw-bold mb-0">Configurações</h1>
      <p class="text-body-secondary small mb-0">Gerencie categorias e usuários do sistema</p>
    </div>
  </div>

  <div class="d-flex gap-2 mb-4">
    <button
      v-for="aba in abas"
      :key="aba.nome"
      type="button"
      class="btn rounded-pill px-3"
      :class="route.name === aba.nome ? 'btn-primary' : 'btn-outline-secondary'"
      @click="router.push({ name: aba.nome })"
    >
      <i class="bi me-1" :class="aba.icone"></i>{{ aba.rotulo }}
    </button>
  </div>

  <RouterView />
</template>

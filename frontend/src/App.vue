<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'

const auth = useAuthStore()

onMounted(() => {
  if (auth.estaAutenticado) {
    auth.carregarUsuarioAtual().catch(() => auth.logout())
  }
})
</script>

<template>
  <AppHeader v-if="auth.estaAutenticado" />
  <main class="container py-4">
    <RouterView />
  </main>
</template>

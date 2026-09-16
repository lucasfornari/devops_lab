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
  <div class="min-h-screen">
    <AppHeader v-if="auth.estaAutenticado" />
    <RouterView />
  </div>
</template>

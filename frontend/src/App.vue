<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  if (auth.estaAutenticado) {
    auth.carregarUsuarioAtual().catch(() => auth.logout())
  }
})
</script>

<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'

const auth = useAuthStore()
</script>

<template>
  <AppHeader v-if="auth.estaAutenticado" />
  <main class="container py-4">
    <RouterView />
  </main>
</template>

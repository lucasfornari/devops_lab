<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function sair() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div class="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
      <RouterLink to="/" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Chamados
      </RouterLink>

      <div class="flex items-center gap-4">
        <RouterLink to="/chamados/novo" class="btn-ghost text-sm">Novo chamado</RouterLink>
        <span class="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">
          {{ auth.usuario?.nome }}
        </span>
        <button type="button" class="btn-ghost text-sm" @click="sair">Sair</button>
      </div>
    </div>
  </header>
</template>

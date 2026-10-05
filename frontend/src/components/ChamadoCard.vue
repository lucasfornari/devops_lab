<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Chamado } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

defineProps<{ chamado: Chamado }>()
</script>

<template>
  <RouterLink
    :to="`/chamados/${chamado.id}`"
    class="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-inherit no-underline transition hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
  >
    <span class="flex-1 font-semibold text-gray-900 dark:text-gray-100">{{ chamado.titulo }}</span>
    <StatusBadge :status="chamado.status" />
    <PriorityBadge :prioridade="chamado.prioridade" />
    <span class="text-sm text-gray-500 dark:text-gray-400">{{ chamado.solicitante.nome }}</span>
  </RouterLink>
</template>

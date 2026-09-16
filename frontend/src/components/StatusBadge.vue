<script setup lang="ts">
import { computed } from 'vue'
import type { StatusChamado } from '@/types'

const props = defineProps<{ status: StatusChamado }>()

const rotulos: Record<StatusChamado, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
}

const cores: Record<StatusChamado, string> = {
  ABERTO: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  EM_ANDAMENTO: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  RESOLVIDO: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  FECHADO: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const rotulo = computed(() => rotulos[props.status])
const cor = computed(() => cores[props.status])
</script>

<template>
  <span class="badge" :class="cor">{{ rotulo }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PrioridadeChamado } from '@/types'

const props = defineProps<{ prioridade: PrioridadeChamado }>()

const rotulos: Record<PrioridadeChamado, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
}

const cores: Record<PrioridadeChamado, string> = {
  BAIXA: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  MEDIA: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  ALTA: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

const rotulo = computed(() => rotulos[props.prioridade])
const cor = computed(() => cores[props.prioridade])
</script>

<template>
  <span class="badge" :class="cor">{{ rotulo }}</span>
</template>

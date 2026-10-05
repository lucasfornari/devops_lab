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
  BAIXA: 'text-bg-light border',
  MEDIA: 'text-bg-info',
  ALTA: 'text-bg-danger',
}

const rotulo = computed(() => rotulos[props.prioridade])
const cor = computed(() => cores[props.prioridade])
</script>

<template>
  <span class="badge" :class="cor">{{ rotulo }}</span>
</template>

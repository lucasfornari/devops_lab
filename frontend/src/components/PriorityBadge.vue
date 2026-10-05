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
  BAIXA: 'bg-secondary-subtle text-secondary-emphasis',
  MEDIA: 'bg-info-subtle text-info-emphasis',
  ALTA: 'bg-danger-subtle text-danger-emphasis',
}

const rotulo = computed(() => rotulos[props.prioridade])
const cor = computed(() => cores[props.prioridade])
</script>

<template>
  <span class="badge rounded-pill fw-semibold" :class="cor">
    <i class="bi bi-flag-fill me-1"></i>{{ rotulo }}
  </span>
</template>

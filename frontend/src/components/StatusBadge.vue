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
  ABERTO: 'bg-primary-subtle text-primary-emphasis',
  EM_ANDAMENTO: 'bg-warning-subtle text-warning-emphasis',
  RESOLVIDO: 'bg-success-subtle text-success-emphasis',
  FECHADO: 'bg-secondary-subtle text-secondary-emphasis',
}

const rotulo = computed(() => rotulos[props.status])
const cor = computed(() => cores[props.status])
</script>

<template>
  <span class="badge rounded-pill fw-semibold" :class="cor">
    <i class="bi bi-circle-fill me-1" style="font-size: 0.45rem; vertical-align: middle"></i>{{ rotulo }}
  </span>
</template>

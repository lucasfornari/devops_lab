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
  ABERTO: 'text-bg-primary',
  EM_ANDAMENTO: 'text-bg-warning',
  RESOLVIDO: 'text-bg-success',
  FECHADO: 'text-bg-secondary',
}

const rotulo = computed(() => rotulos[props.status])
const cor = computed(() => cores[props.status])
</script>

<template>
  <span class="badge" :class="cor">{{ rotulo }}</span>
</template>

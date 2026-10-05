<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Chamado } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const props = defineProps<{ chamado: Chamado }>()
const router = useRouter()

function abrir() {
  router.push(`/chamados/${props.chamado.id}`)
}
</script>

<template>
  <button type="button" class="list-group-item list-group-item-action py-3" @click="abrir">
    <div class="d-flex flex-wrap align-items-center gap-2">
      <span class="fw-semibold flex-grow-1">#{{ chamado.id }} {{ chamado.titulo }}</span>
      <StatusBadge :status="chamado.status" />
      <PriorityBadge :prioridade="chamado.prioridade" />
    </div>
    <small class="text-body-secondary">
      {{ chamado.solicitante.nome }} · {{ new Date(chamado.criadoEm).toLocaleString('pt-BR') }}
    </small>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Chamado, PrioridadeChamado } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const props = defineProps<{ chamado: Chamado }>()
const router = useRouter()

const coresPrioridade: Record<PrioridadeChamado, string> = {
  BAIXA: 'bg-secondary',
  MEDIA: 'bg-info',
  ALTA: 'bg-danger',
}

const corPrioridade = computed(() => coresPrioridade[props.chamado.prioridade])

function abrir() {
  router.push(`/chamados/${props.chamado.id}`)
}
</script>

<template>
  <button
    type="button"
    class="card card-hover border-0 shadow-sm rounded-4 w-100 text-start overflow-hidden"
    @click="abrir"
  >
    <div class="d-flex w-100">
      <div :class="corPrioridade" style="width: 5px"></div>
      <div class="card-body px-4 py-3" style="min-width: 0">
        <div class="d-flex flex-column flex-sm-row justify-content-between gap-2">
          <div style="min-width: 0">
            <span class="small text-body-secondary fw-semibold">#{{ chamado.id }}</span>
            <h2 class="h6 fw-semibold mb-0 text-truncate">{{ chamado.titulo }}</h2>
          </div>
          <div class="d-flex gap-1 flex-shrink-0 align-self-sm-start">
            <StatusBadge :status="chamado.status" />
            <PriorityBadge :prioridade="chamado.prioridade" />
          </div>
        </div>
        <div class="d-flex flex-wrap gap-3 mt-2 small text-body-secondary">
          <span><i class="bi bi-person me-1"></i>{{ chamado.solicitante.nome }}</span>
          <span v-if="chamado.responsavel">
            <i class="bi bi-person-gear me-1"></i>{{ chamado.responsavel.nome }}
          </span>
          <span><i class="bi bi-tag me-1"></i>{{ chamado.categoria?.nome ?? 'Sem categoria' }}</span>
          <span><i class="bi bi-calendar3 me-1"></i>{{ new Date(chamado.criadoEm).toLocaleDateString('pt-BR') }}</span>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listarChamados } from '@/services/chamados'
import type { Chamado, StatusChamado } from '@/types'
import AlertError from '@/components/AlertError.vue'
import ChamadoCard from '@/components/ChamadoCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const chamados = ref<Chamado[]>([])
const carregando = ref(true)
const erro = ref('')
const filtro = ref<StatusChamado | null>(null)

const resumo = computed(() =>
  (
    [
      { status: 'ABERTO', rotulo: 'Abertos', icone: 'bi-envelope-open', cor: 'primary' },
      { status: 'EM_ANDAMENTO', rotulo: 'Em andamento', icone: 'bi-hourglass-split', cor: 'warning' },
      { status: 'RESOLVIDO', rotulo: 'Resolvidos', icone: 'bi-check2-circle', cor: 'success' },
      { status: 'FECHADO', rotulo: 'Fechados', icone: 'bi-archive', cor: 'secondary' },
    ] as const
  ).map((item) => ({ ...item, total: chamados.value.filter((c) => c.status === item.status).length })),
)

const filtrados = computed(() =>
  filtro.value ? chamados.value.filter((c) => c.status === filtro.value) : chamados.value,
)

function alternarFiltro(status: StatusChamado) {
  filtro.value = filtro.value === status ? null : status
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    chamados.value = await listarChamados()
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'não foi possível carregar os chamados'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="mb-4">
    <h1 class="h3 fw-bold mb-1">Chamados</h1>
    <p class="text-body-secondary mb-0">{{ chamados.length }} chamado(s) no total</p>
  </div>

  <div class="row row-cols-2 row-cols-md-4 g-3 mb-4">
    <div v-for="item in resumo" :key="item.status" class="col">
      <button
        type="button"
        class="card card-hover shadow-sm rounded-4 w-100 h-100 text-start"
        :class="filtro === item.status ? `border border-2 border-${item.cor}` : 'border-0'"
        @click="alternarFiltro(item.status)"
      >
        <div class="card-body d-flex align-items-center gap-3">
          <span
            class="icone-redondo fs-5"
            :class="`bg-${item.cor}-subtle text-${item.cor}-emphasis`"
            style="width: 2.75rem; height: 2.75rem"
          >
            <i class="bi" :class="item.icone"></i>
          </span>
          <div>
            <div class="fs-4 fw-bold lh-1">{{ item.total }}</div>
            <div class="small text-body-secondary">{{ item.rotulo }}</div>
          </div>
        </div>
      </button>
    </div>
  </div>

  <div v-if="filtro" class="d-flex align-items-center gap-2 mb-3 small">
    <span class="text-body-secondary">Filtrando por</span>
    <StatusBadge :status="filtro" />
    <button type="button" class="btn btn-link btn-sm p-0" @click="filtro = null">limpar</button>
  </div>

  <div v-if="carregando" class="text-center text-body-secondary py-5">
    <div class="spinner-border spinner-border-sm me-2"></div>Carregando...
  </div>
  <AlertError v-else-if="erro" :mensagem="erro" />
  <div v-else-if="filtrados.length === 0" class="card border-0 shadow-sm rounded-4">
    <div class="card-body text-center py-5">
      <i class="bi bi-inbox fs-1 text-body-secondary"></i>
      <p class="text-body-secondary mt-2 mb-0">Nenhum chamado encontrado.</p>
    </div>
  </div>

  <div v-else class="d-flex flex-column gap-3">
    <ChamadoCard v-for="chamado in filtrados" :key="chamado.id" :chamado="chamado" />
  </div>
</template>

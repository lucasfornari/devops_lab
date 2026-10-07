<script setup lang="ts">
import type { FiltroAtribuicao } from '@/types'

defineProps<{ mostrarAtribuicao: boolean }>()
const busca = defineModel<string>('busca', { required: true })
const atribuicao = defineModel<FiltroAtribuicao | undefined>('atribuicao')

const abas: { valor: FiltroAtribuicao | undefined; rotulo: string; icone: string }[] = [
  { valor: undefined, rotulo: 'Todos', icone: 'bi-collection' },
  { valor: 'SEM_RESPONSAVEL', rotulo: 'Sem responsável', icone: 'bi-person-dash' },
  { valor: 'MEUS', rotulo: 'Meus atendimentos', icone: 'bi-person-check' },
]
</script>

<template>
  <div class="d-flex flex-column flex-md-row gap-3 mb-4">
    <div v-if="mostrarAtribuicao" class="d-flex flex-wrap gap-2">
      <button
        v-for="aba in abas"
        :key="aba.rotulo"
        type="button"
        class="btn btn-sm rounded-pill px-3"
        :class="atribuicao === aba.valor ? 'btn-primary' : 'btn-outline-secondary'"
        @click="atribuicao = aba.valor"
      >
        <i class="bi me-1" :class="aba.icone"></i>{{ aba.rotulo }}
      </button>
    </div>

    <div class="input-group ms-md-auto" style="max-width: 22rem">
      <span class="input-group-text bg-body rounded-start-pill"><i class="bi bi-search"></i></span>
      <input
        v-model="busca"
        type="search"
        maxlength="150"
        placeholder="Buscar por título ou descrição"
        aria-label="Buscar chamados"
        class="form-control rounded-end-pill"
      />
    </div>
  </div>
</template>

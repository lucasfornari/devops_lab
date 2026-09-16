<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { listarChamados } from '@/services/chamados'
import type { Chamado } from '@/types'
import AlertError from '@/components/AlertError.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const chamados = ref<Chamado[]>([])
const carregando = ref(true)
const erro = ref('')

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
  <div class="page">
    <p v-if="carregando" class="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
    <AlertError v-else-if="erro" :mensagem="erro" />
    <p v-else-if="chamados.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      Nenhum chamado encontrado.
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li v-for="chamado in chamados" :key="chamado.id">
        <RouterLink
          :to="`/chamados/${chamado.id}`"
          class="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-inherit no-underline transition hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
        >
          <span class="flex-1 font-semibold text-gray-900 dark:text-gray-100">{{ chamado.titulo }}</span>
          <StatusBadge :status="chamado.status" />
          <PriorityBadge :prioridade="chamado.prioridade" />
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ chamado.solicitante.nome }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

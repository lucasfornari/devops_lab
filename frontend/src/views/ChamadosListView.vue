<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listarChamados } from '@/services/chamados'
import type { Chamado } from '@/types'
import AlertError from '@/components/AlertError.vue'
import ChamadoCard from '@/components/ChamadoCard.vue'

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
        <ChamadoCard :chamado="chamado" />
      </li>
    </ul>
  </div>
</template>

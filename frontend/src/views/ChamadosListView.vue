<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listarChamados } from '@/services/chamados'
import type { Chamado } from '@/types'
import AlertError from '@/components/AlertError.vue'
import ChamadoCard from '@/components/ChamadoCard.vue'

const router = useRouter()
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
  <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
    <h1 class="h4 mb-0">Chamados</h1>
    <button type="button" class="btn btn-primary" @click="router.push('/chamados/novo')">Novo chamado</button>
  </div>

  <p v-if="carregando" class="text-body-secondary">Carregando...</p>
  <AlertError v-else-if="erro" :mensagem="erro" />
  <p v-else-if="chamados.length === 0" class="text-body-secondary">Nenhum chamado encontrado.</p>

  <div v-else class="list-group shadow-sm">
    <ChamadoCard v-for="chamado in chamados" :key="chamado.id" :chamado="chamado" />
  </div>
</template>

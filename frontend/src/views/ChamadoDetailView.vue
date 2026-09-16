<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { adicionarComentario, atualizarStatusChamado, buscarChamado } from '@/services/chamados'
import { useAuthStore } from '@/stores/auth'
import type { Chamado, StatusChamado } from '@/types'
import AlertError from '@/components/AlertError.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'

const route = useRoute()
const auth = useAuthStore()

const chamado = ref<Chamado | null>(null)
const carregando = ref(true)
const erro = ref('')
const novoComentario = ref('')
const enviandoComentario = ref(false)
const atualizandoStatus = ref(false)

const ehEquipeSuporte = computed(
  () => auth.usuario?.papel === 'AGENTE' || auth.usuario?.papel === 'ADMIN',
)

const opcoesStatus: StatusChamado[] = ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO']

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    chamado.value = await buscarChamado(Number(route.params.id))
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'não foi possível carregar o chamado'
  } finally {
    carregando.value = false
  }
}

async function mudarStatus(status: StatusChamado) {
  if (!chamado.value) return
  atualizandoStatus.value = true
  try {
    chamado.value = await atualizarStatusChamado(chamado.value.id, status)
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'não foi possível atualizar o status'
  } finally {
    atualizandoStatus.value = false
  }
}

async function enviarComentario() {
  if (!chamado.value || !novoComentario.value.trim()) return
  enviandoComentario.value = true
  try {
    chamado.value = await adicionarComentario(chamado.value.id, novoComentario.value.trim())
    novoComentario.value = ''
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'não foi possível adicionar o comentário'
  } finally {
    enviandoComentario.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="page flex flex-col gap-4">
    <RouterLink to="/" class="btn-ghost self-start px-0">&larr; Voltar</RouterLink>

    <p v-if="carregando" class="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
    <AlertError v-else-if="erro && !chamado" :mensagem="erro" />

    <template v-else-if="chamado">
      <header class="flex flex-wrap items-center gap-3">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ chamado.titulo }}</h1>
        <StatusBadge :status="chamado.status" />
        <PriorityBadge :prioridade="chamado.prioridade" />
      </header>

      <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ chamado.descricao }}</p>

      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt class="text-gray-500 dark:text-gray-400">Solicitante</dt>
        <dd>{{ chamado.solicitante.nome }}</dd>
        <dt class="text-gray-500 dark:text-gray-400">Responsável</dt>
        <dd>{{ chamado.responsavel?.nome ?? '— não atribuído —' }}</dd>
        <dt class="text-gray-500 dark:text-gray-400">Categoria</dt>
        <dd>{{ chamado.categoria?.nome ?? '— sem categoria —' }}</dd>
      </dl>

      <div v-if="ehEquipeSuporte">
        <label class="form-label max-w-xs">
          Status
          <select
            :value="chamado.status"
            :disabled="atualizandoStatus"
            class="form-control"
            @change="mudarStatus(($event.target as HTMLSelectElement).value as StatusChamado)"
          >
            <option v-for="opcao in opcoesStatus" :key="opcao" :value="opcao">{{ opcao }}</option>
          </select>
        </label>
      </div>

      <section class="flex flex-col gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Comentários</h2>
        <ul class="flex flex-col gap-3">
          <li
            v-for="comentario in chamado.comentarios"
            :key="comentario.id"
            class="card py-3"
          >
            <strong class="text-sm text-gray-900 dark:text-gray-100">{{ comentario.autor.nome }}</strong>
            <p class="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {{ comentario.mensagem }}
            </p>
          </li>
        </ul>

        <form class="mt-2 flex flex-col gap-2" @submit.prevent="enviarComentario">
          <textarea
            v-model="novoComentario"
            rows="3"
            maxlength="2000"
            placeholder="Escreva um comentário..."
            required
            class="form-control"
          ></textarea>
          <button type="submit" class="btn-primary self-start" :disabled="enviandoComentario">
            {{ enviandoComentario ? 'Enviando...' : 'Comentar' }}
          </button>
        </form>
      </section>

      <AlertError v-if="erro" :mensagem="erro" />
    </template>
  </div>
</template>

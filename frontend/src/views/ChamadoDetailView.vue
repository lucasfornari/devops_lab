<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adicionarComentario, atualizarStatusChamado, buscarChamado } from '@/services/chamados'
import { useAuthStore } from '@/stores/auth'
import type { Chamado, StatusChamado } from '@/types'
import AlertError from '@/components/AlertError.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import ComentarioForm from '@/components/ComentarioForm.vue'

const route = useRoute()
const router = useRouter()
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
  <button type="button" class="btn btn-outline-secondary btn-sm mb-3" @click="router.push('/')">&larr; Voltar</button>

  <p v-if="carregando" class="text-body-secondary">Carregando...</p>
  <AlertError v-else-if="erro && !chamado" :mensagem="erro" />

  <template v-else-if="chamado">
    <div class="card shadow-sm mb-4">
      <div class="card-header d-flex flex-wrap align-items-center gap-2">
        <h1 class="h5 mb-0 flex-grow-1">#{{ chamado.id }} {{ chamado.titulo }}</h1>
        <StatusBadge :status="chamado.status" />
        <PriorityBadge :prioridade="chamado.prioridade" />
      </div>
      <div class="card-body">
        <p class="card-text" style="white-space: pre-wrap">{{ chamado.descricao }}</p>

        <dl class="row mb-0 small">
          <dt class="col-5 col-sm-3 text-body-secondary fw-normal">Solicitante</dt>
          <dd class="col-7 col-sm-9">{{ chamado.solicitante.nome }}</dd>
          <dt class="col-5 col-sm-3 text-body-secondary fw-normal">Responsável</dt>
          <dd class="col-7 col-sm-9">{{ chamado.responsavel?.nome ?? 'não atribuído' }}</dd>
          <dt class="col-5 col-sm-3 text-body-secondary fw-normal">Categoria</dt>
          <dd class="col-7 col-sm-9">{{ chamado.categoria?.nome ?? 'sem categoria' }}</dd>
          <dt class="col-5 col-sm-3 text-body-secondary fw-normal">Aberto em</dt>
          <dd class="col-7 col-sm-9 mb-0">{{ new Date(chamado.criadoEm).toLocaleString('pt-BR') }}</dd>
        </dl>
      </div>
      <div v-if="ehEquipeSuporte" class="card-footer">
        <label for="status" class="form-label small mb-1">Status</label>
        <select
          id="status"
          :value="chamado.status"
          :disabled="atualizandoStatus"
          class="form-select form-select-sm w-auto"
          @change="mudarStatus(($event.target as HTMLSelectElement).value as StatusChamado)"
        >
          <option v-for="opcao in opcoesStatus" :key="opcao" :value="opcao">{{ opcao }}</option>
        </select>
      </div>
    </div>

    <h2 class="h5 mb-3">Comentários</h2>
    <p v-if="!chamado.comentarios?.length" class="text-body-secondary small">Nenhum comentário ainda.</p>
    <ul v-else class="list-group mb-3">
      <li v-for="comentario in chamado.comentarios" :key="comentario.id" class="list-group-item">
        <div class="d-flex flex-wrap justify-content-between gap-2">
          <strong class="small">{{ comentario.autor.nome }}</strong>
          <small class="text-body-secondary">{{ new Date(comentario.criadoEm).toLocaleString('pt-BR') }}</small>
        </div>
        <p class="mb-0 mt-1 small" style="white-space: pre-wrap">{{ comentario.mensagem }}</p>
      </li>
    </ul>

    <ComentarioForm v-model="novoComentario" :enviando="enviandoComentario" @enviar="enviarComentario" />

    <AlertError v-if="erro" :mensagem="erro" class="mt-3" />
  </template>
</template>

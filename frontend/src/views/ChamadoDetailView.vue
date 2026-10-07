<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adicionarComentario, buscarChamado, excluirChamado } from '@/services/chamados'
import { useAuthStore } from '@/stores/auth'
import type { Chamado } from '@/types'
import { mensagemDeErro } from '@/utils/erros'
import { podeEditarChamado, podeExcluirChamado } from '@/utils/permissoes'
import AlertError from '@/components/AlertError.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import ComentarioForm from '@/components/ComentarioForm.vue'
import AvatarIniciais from '@/components/AvatarIniciais.vue'
import PainelAtendimento from '@/components/PainelAtendimento.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const chamado = ref<Chamado | null>(null)
const carregando = ref(true)
const erro = ref('')
const novoComentario = ref('')
const enviandoComentario = ref(false)
const excluindo = ref(false)

const podeEditar = computed(() => !!chamado.value && podeEditarChamado(chamado.value, auth.usuario))
const podeExcluir = computed(() => !!chamado.value && podeExcluirChamado(chamado.value, auth.usuario))

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    chamado.value = await buscarChamado(Number(route.params.id))
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível carregar o chamado')
  } finally {
    carregando.value = false
  }
}

function aplicarAtualizacao(atualizado: Chamado) {
  chamado.value = { ...atualizado, comentarios: chamado.value?.comentarios }
}

async function excluir() {
  if (!chamado.value || !confirm(`Excluir o chamado #${chamado.value.id}? Essa ação não pode ser desfeita.`)) return
  excluindo.value = true
  try {
    await excluirChamado(chamado.value.id)
    router.push('/')
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível excluir o chamado')
    excluindo.value = false
  }
}

async function enviarComentario() {
  if (!chamado.value || !novoComentario.value.trim()) return
  enviandoComentario.value = true
  try {
    chamado.value = await adicionarComentario(chamado.value.id, novoComentario.value.trim())
    novoComentario.value = ''
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível adicionar o comentário')
  } finally {
    enviandoComentario.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
    <button type="button" class="btn btn-link text-decoration-none px-0 me-auto" @click="router.push('/')">
      <i class="bi bi-arrow-left me-1"></i> Voltar para chamados
    </button>
    <button
      v-if="podeEditar"
      type="button"
      class="btn btn-outline-secondary btn-sm rounded-pill px-3"
      @click="router.push(`/chamados/${chamado?.id}/editar`)"
    >
      <i class="bi bi-pencil me-1"></i>Editar
    </button>
    <button
      v-if="podeExcluir"
      type="button"
      class="btn btn-outline-danger btn-sm rounded-pill px-3"
      :disabled="excluindo"
      @click="excluir"
    >
      <i class="bi bi-trash me-1"></i>Excluir
    </button>
  </div>

  <div v-if="carregando" class="text-center text-body-secondary py-5">
    <div class="spinner-border spinner-border-sm me-2"></div>Carregando...
  </div>
  <AlertError v-else-if="erro && !chamado" :mensagem="erro" />

  <div v-else-if="chamado" class="row g-4">
    <div class="col-12 col-lg-8 d-flex flex-column gap-4">
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <span class="small text-body-secondary fw-semibold">
            #{{ chamado.id }} · aberto em {{ new Date(chamado.criadoEm).toLocaleString('pt-BR') }}
          </span>
          <h1 class="h4 fw-bold mt-1 mb-2">{{ chamado.titulo }}</h1>
          <div class="d-flex gap-1 mb-4">
            <StatusBadge :status="chamado.status" />
            <PriorityBadge :prioridade="chamado.prioridade" />
          </div>
          <p class="mb-0" style="white-space: pre-wrap">{{ chamado.descricao }}</p>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <h2 class="h6 fw-bold mb-4">
            <i class="bi bi-chat-left-text me-2"></i>Comentários
            <span class="badge rounded-pill bg-body-tertiary text-body-secondary ms-1">
              {{ chamado.comentarios?.length ?? 0 }}
            </span>
          </h2>

          <p v-if="!chamado.comentarios?.length" class="text-body-secondary small">Nenhum comentário ainda.</p>
          <div v-else class="d-flex flex-column gap-3 mb-4">
            <div v-for="comentario in chamado.comentarios" :key="comentario.id" class="d-flex gap-3">
              <AvatarIniciais :nome="comentario.autor.nome" />
              <div class="flex-grow-1" style="min-width: 0">
                <div class="d-flex flex-wrap align-items-baseline gap-2 mb-1">
                  <strong class="small">{{ comentario.autor.nome }}</strong>
                  <small class="text-body-secondary">
                    {{ new Date(comentario.criadoEm).toLocaleString('pt-BR') }}
                  </small>
                </div>
                <div class="bg-body-tertiary rounded-3 px-3 py-2 small" style="white-space: pre-wrap">{{ comentario.mensagem }}</div>
              </div>
            </div>
          </div>

          <ComentarioForm v-model="novoComentario" :enviando="enviandoComentario" @enviar="enviarComentario" />
        </div>
      </div>

      <AlertError v-if="erro" :mensagem="erro" />
    </div>

    <div class="col-12 col-lg-4 d-flex flex-column gap-4">
      <PainelAtendimento v-if="auth.ehEquipeSuporte" :chamado="chamado" @atualizado="aplicarAtualizacao" />

      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <h2 class="h6 fw-bold mb-3">Detalhes</h2>

          <dl class="mb-0 d-flex flex-column gap-3 small">
            <div>
              <dt class="text-body-secondary fw-normal mb-1">Solicitante</dt>
              <dd class="mb-0 d-flex align-items-center gap-2">
                <AvatarIniciais :nome="chamado.solicitante.nome" :tamanho="28" />
                {{ chamado.solicitante.nome }}
              </dd>
            </div>
            <div>
              <dt class="text-body-secondary fw-normal mb-1">Responsável</dt>
              <dd class="mb-0 d-flex align-items-center gap-2">
                <template v-if="chamado.responsavel">
                  <AvatarIniciais :nome="chamado.responsavel.nome" :tamanho="28" />
                  {{ chamado.responsavel.nome }}
                </template>
                <span v-else class="text-body-secondary fst-italic">Não atribuído</span>
              </dd>
            </div>
            <div>
              <dt class="text-body-secondary fw-normal mb-1">Categoria</dt>
              <dd class="mb-0"><i class="bi bi-tag me-1"></i>{{ chamado.categoria?.nome ?? 'Sem categoria' }}</dd>
            </div>
            <div>
              <dt class="text-body-secondary fw-normal mb-1">Última atualização</dt>
              <dd class="mb-0">
                <i class="bi bi-clock me-1"></i>{{ new Date(chamado.atualizadoEm).toLocaleString('pt-BR') }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

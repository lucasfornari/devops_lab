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
import AvatarIniciais from '@/components/AvatarIniciais.vue'

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

const opcoesStatus: { valor: StatusChamado; rotulo: string }[] = [
  { valor: 'ABERTO', rotulo: 'Aberto' },
  { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
  { valor: 'RESOLVIDO', rotulo: 'Resolvido' },
  { valor: 'FECHADO', rotulo: 'Fechado' },
]

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
  <button type="button" class="btn btn-link text-decoration-none px-0 mb-3" @click="router.push('/')">
    <i class="bi bi-arrow-left me-1"></i> Voltar para chamados
  </button>

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

    <div class="col-12 col-lg-4">
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <h2 class="h6 fw-bold mb-3">Detalhes</h2>

          <div v-if="ehEquipeSuporte" class="mb-3">
            <label for="status" class="form-label small text-body-secondary mb-1">Alterar status</label>
            <select
              id="status"
              :value="chamado.status"
              :disabled="atualizandoStatus"
              class="form-select rounded-3"
              @change="mudarStatus(($event.target as HTMLSelectElement).value as StatusChamado)"
            >
              <option v-for="opcao in opcoesStatus" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
            </select>
          </div>

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

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listarCategorias } from '@/services/categorias'
import { atualizarChamado, buscarChamado, criarChamado } from '@/services/chamados'
import type { Categoria, PrioridadeChamado } from '@/types'
import { mensagemDeErro } from '@/utils/erros'
import AlertError from '@/components/AlertError.vue'

const route = useRoute()
const router = useRouter()

const idEdicao = computed(() => (route.params.id ? Number(route.params.id) : null))
const destinoAoSair = computed(() => (idEdicao.value ? `/chamados/${idEdicao.value}` : '/'))

const titulo = ref('')
const descricao = ref('')
const categoriaId = ref<number | ''>('')
const prioridade = ref<PrioridadeChamado>('MEDIA')
const categorias = ref<Categoria[]>([])
const enviando = ref(false)
const erro = ref('')

const opcoesPrioridade: { valor: PrioridadeChamado; rotulo: string; cor: string }[] = [
  { valor: 'BAIXA', rotulo: 'Baixa', cor: 'secondary' },
  { valor: 'MEDIA', rotulo: 'Média', cor: 'info' },
  { valor: 'ALTA', rotulo: 'Alta', cor: 'danger' },
]

async function preencherComChamado(id: number) {
  const chamado = await buscarChamado(id)
  titulo.value = chamado.titulo
  descricao.value = chamado.descricao
  prioridade.value = chamado.prioridade
  categoriaId.value = chamado.categoria?.id ?? ''
}

onMounted(async () => {
  try {
    const [lista] = await Promise.all([
      listarCategorias(),
      idEdicao.value ? preencherComChamado(idEdicao.value) : undefined,
    ])
    categorias.value = lista
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível carregar o formulário')
  }
})

async function salvar() {
  const dados = {
    titulo: titulo.value,
    descricao: descricao.value,
    prioridade: prioridade.value,
  }
  const categoria = categoriaId.value === '' ? null : categoriaId.value

  const chamado = idEdicao.value
    ? await atualizarChamado(idEdicao.value, { ...dados, categoriaId: categoria })
    : await criarChamado({ ...dados, categoriaId: categoria ?? undefined })
  router.push(`/chamados/${chamado.id}`)
}

async function enviar() {
  erro.value = ''
  enviando.value = true
  try {
    await salvar()
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível salvar o chamado')
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <button type="button" class="btn btn-link text-decoration-none px-0 mb-3" @click="router.push(destinoAoSair)">
    <i class="bi bi-arrow-left me-1"></i> Voltar
  </button>

  <div class="row justify-content-center">
    <div class="col-12 col-lg-9">
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4 p-md-5">
          <div class="d-flex align-items-center gap-3 mb-4">
            <span class="icone-redondo bg-primary-subtle text-primary-emphasis fs-4" style="width: 3rem; height: 3rem">
              <i class="bi bi-pencil-square"></i>
            </span>
            <div>
              <h1 class="h4 fw-bold mb-0">{{ idEdicao ? `Editar chamado #${idEdicao}` : 'Novo chamado' }}</h1>
              <p class="text-body-secondary small mb-0">Descreva o problema com o máximo de detalhes</p>
            </div>
          </div>

          <form class="d-flex flex-column gap-4" @submit.prevent="enviar">
            <div>
              <label for="titulo" class="form-label fw-semibold">Título</label>
              <input
                id="titulo"
                v-model="titulo"
                type="text"
                required
                maxlength="150"
                placeholder="Ex.: Impressora do 2º andar não imprime"
                class="form-control form-control-lg rounded-3"
              />
            </div>

            <div>
              <label for="descricao" class="form-label fw-semibold">Descrição</label>
              <textarea
                id="descricao"
                v-model="descricao"
                required
                maxlength="4000"
                rows="6"
                placeholder="O que aconteceu? Desde quando? Já tentou algo?"
                class="form-control rounded-3"
              ></textarea>
            </div>

            <div class="row g-4">
              <div class="col-12 col-md-6">
                <span class="form-label fw-semibold d-block">Prioridade</span>
                <div class="d-flex gap-2" role="group">
                  <template v-for="opcao in opcoesPrioridade" :key="opcao.valor">
                    <input
                      :id="`prioridade-${opcao.valor}`"
                      v-model="prioridade"
                      type="radio"
                      class="btn-check"
                      :value="opcao.valor"
                    />
                    <label
                      :for="`prioridade-${opcao.valor}`"
                      class="btn rounded-pill flex-fill"
                      :class="`btn-outline-${opcao.cor}`"
                    >
                      {{ opcao.rotulo }}
                    </label>
                  </template>
                </div>
              </div>

              <div v-if="categorias.length > 0" class="col-12 col-md-6">
                <label for="categoria" class="form-label fw-semibold">Categoria</label>
                <select id="categoria" v-model="categoriaId" class="form-select rounded-3">
                  <option value="">Sem categoria</option>
                  <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                    {{ categoria.nome }}
                  </option>
                </select>
              </div>
            </div>

            <AlertError v-if="erro" :mensagem="erro" />

            <div class="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 pt-2">
              <button type="button" class="btn btn-light rounded-pill px-4" @click="router.push(destinoAoSair)">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="enviando">
                <i class="bi bi-check-lg me-1"></i>
                {{ enviando ? 'Salvando...' : idEdicao ? 'Salvar alterações' : 'Criar chamado' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

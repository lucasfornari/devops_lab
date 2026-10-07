<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { atualizarCategoria, criarCategoria, excluirCategoria, listarCategorias } from '@/services/categorias'
import type { Categoria } from '@/types'
import { mensagemDeErro } from '@/utils/erros'
import AlertError from '@/components/AlertError.vue'

const categorias = ref<Categoria[]>([])
const nome = ref('')
const emEdicao = ref<Categoria | null>(null)
const salvando = ref(false)
const erro = ref('')

async function carregar() {
  try {
    categorias.value = await listarCategorias()
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível carregar as categorias')
  }
}

function editar(categoria: Categoria) {
  emEdicao.value = categoria
  nome.value = categoria.nome
}

function cancelarEdicao() {
  emEdicao.value = null
  nome.value = ''
}

async function executar(acao: () => Promise<unknown>) {
  salvando.value = true
  erro.value = ''
  try {
    await acao()
    cancelarEdicao()
    await carregar()
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível salvar a categoria')
  } finally {
    salvando.value = false
  }
}

function salvar() {
  const dados = { nome: nome.value }
  return executar(() =>
    emEdicao.value ? atualizarCategoria(emEdicao.value.id, dados) : criarCategoria(dados),
  )
}

function excluir(categoria: Categoria) {
  if (!confirm(`Excluir a categoria "${categoria.nome}"? Os chamados dela ficarão sem categoria.`)) return
  return executar(() => excluirCategoria(categoria.id))
}

onMounted(carregar)
</script>

<template>
  <div class="card border-0 shadow-sm rounded-4">
    <div class="card-body p-4">
      <form class="d-flex flex-column flex-sm-row gap-2 mb-4" @submit.prevent="salvar">
        <input
          v-model="nome"
          type="text"
          required
          maxlength="80"
          :placeholder="emEdicao ? `Novo nome para ${emEdicao.nome}` : 'Nome da nova categoria'"
          aria-label="Nome da categoria"
          class="form-control rounded-pill"
        />
        <button type="submit" class="btn btn-primary rounded-pill px-4 text-nowrap" :disabled="salvando">
          <i class="bi me-1" :class="emEdicao ? 'bi-check-lg' : 'bi-plus-lg'"></i>{{ emEdicao ? 'Salvar' : 'Adicionar' }}
        </button>
        <button v-if="emEdicao" type="button" class="btn btn-light rounded-pill px-4" @click="cancelarEdicao">
          Cancelar
        </button>
      </form>

      <AlertError v-if="erro" :mensagem="erro" class="mb-3" />

      <p v-if="categorias.length === 0" class="text-body-secondary small mb-0">Nenhuma categoria cadastrada.</p>
      <ul v-else class="list-group list-group-flush">
        <li
          v-for="categoria in categorias"
          :key="categoria.id"
          class="list-group-item d-flex align-items-center gap-2 px-0"
        >
          <i class="bi bi-tag text-body-secondary"></i>
          <span class="me-auto">{{ categoria.nome }}</span>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary rounded-pill"
            :aria-label="`Editar ${categoria.nome}`"
            @click="editar(categoria)"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-danger rounded-pill"
            :aria-label="`Excluir ${categoria.nome}`"
            :disabled="salvando"
            @click="excluir(categoria)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

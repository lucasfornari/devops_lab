<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { criarChamado, listarCategorias } from '@/services/chamados'
import type { Categoria, PrioridadeChamado } from '@/types'
import AlertError from '@/components/AlertError.vue'

const router = useRouter()

const titulo = ref('')
const descricao = ref('')
const categoriaId = ref<number | ''>('')
const prioridade = ref<PrioridadeChamado>('MEDIA')
const categorias = ref<Categoria[]>([])
const enviando = ref(false)
const erro = ref('')

onMounted(async () => {
  try {
    categorias.value = await listarCategorias()
  } catch {
    categorias.value = []
  }
})

async function enviar() {
  erro.value = ''
  enviando.value = true
  try {
    const chamado = await criarChamado({
      titulo: titulo.value,
      descricao: descricao.value,
      prioridade: prioridade.value,
      categoriaId: categoriaId.value === '' ? undefined : categoriaId.value,
    })
    router.push(`/chamados/${chamado.id}`)
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'não foi possível criar o chamado'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="d-flex align-items-center gap-2 mb-3">
    <button type="button" class="btn btn-outline-secondary btn-sm" @click="router.push('/')">&larr; Voltar</button>
    <h1 class="h4 mb-0">Novo chamado</h1>
  </div>

  <div class="card shadow-sm">
    <div class="card-body">
      <form class="d-flex flex-column gap-3" @submit.prevent="enviar">
        <div>
          <label for="titulo" class="form-label">Título</label>
          <input id="titulo" v-model="titulo" type="text" required maxlength="150" class="form-control" />
        </div>

        <div>
          <label for="descricao" class="form-label">Descrição</label>
          <textarea
            id="descricao"
            v-model="descricao"
            required
            maxlength="4000"
            rows="6"
            class="form-control"
          ></textarea>
        </div>

        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <label for="prioridade" class="form-label">Prioridade</label>
            <select id="prioridade" v-model="prioridade" class="form-select">
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>

          <div v-if="categorias.length > 0" class="col-12 col-sm-6">
            <label for="categoria" class="form-label">Categoria</label>
            <select id="categoria" v-model="categoriaId" class="form-select">
              <option value="">Sem categoria</option>
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                {{ categoria.nome }}
              </option>
            </select>
          </div>
        </div>

        <AlertError v-if="erro" :mensagem="erro" />

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" :disabled="enviando">
            {{ enviando ? 'Enviando...' : 'Criar chamado' }}
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="router.push('/')">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

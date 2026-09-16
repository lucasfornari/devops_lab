<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
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
    // sem categorias cadastradas ainda — segue sem a lista
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
  <div class="page">
    <h1 class="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Novo chamado</h1>

    <form class="card flex flex-col gap-4" @submit.prevent="enviar">
      <label class="form-label">
        Título
        <input v-model="titulo" type="text" required maxlength="150" class="form-control" />
      </label>

      <label class="form-label">
        Descrição
        <textarea v-model="descricao" required maxlength="4000" rows="6" class="form-control"></textarea>
      </label>

      <label class="form-label">
        Prioridade
        <select v-model="prioridade" class="form-control">
          <option value="BAIXA">Baixa</option>
          <option value="MEDIA">Média</option>
          <option value="ALTA">Alta</option>
        </select>
      </label>

      <label v-if="categorias.length > 0" class="form-label">
        Categoria
        <select v-model="categoriaId" class="form-control">
          <option value="">Sem categoria</option>
          <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
            {{ categoria.nome }}
          </option>
        </select>
      </label>

      <AlertError v-if="erro" :mensagem="erro" />

      <div class="flex items-center gap-4">
        <button type="submit" class="btn-primary" :disabled="enviando">
          {{ enviando ? 'Enviando...' : 'Criar chamado' }}
        </button>
        <RouterLink to="/" class="btn-ghost">Cancelar</RouterLink>
      </div>
    </form>
  </div>
</template>

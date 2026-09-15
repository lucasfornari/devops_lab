<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { criarChamado, listarCategorias } from '@/services/chamados'
import type { Categoria, PrioridadeChamado } from '@/types'

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
  <div class="pagina">
    <h1>Novo chamado</h1>

    <form class="formulario" @submit.prevent="enviar">
      <label>
        Título
        <input v-model="titulo" type="text" required maxlength="150" />
      </label>

      <label>
        Descrição
        <textarea v-model="descricao" required maxlength="4000" rows="6"></textarea>
      </label>

      <label>
        Prioridade
        <select v-model="prioridade">
          <option value="BAIXA">Baixa</option>
          <option value="MEDIA">Média</option>
          <option value="ALTA">Alta</option>
        </select>
      </label>

      <label v-if="categorias.length > 0">
        Categoria
        <select v-model="categoriaId">
          <option value="">Sem categoria</option>
          <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
            {{ categoria.nome }}
          </option>
        </select>
      </label>

      <p v-if="erro" class="erro">{{ erro }}</p>

      <div class="acoes">
        <button type="submit" :disabled="enviando">{{ enviando ? 'Enviando...' : 'Criar chamado' }}</button>
        <RouterLink to="/">Cancelar</RouterLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
.pagina {
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

input,
textarea,
select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
}

.acoes {
  display: flex;
  align-items: center;
  gap: 1rem;
}

button {
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}

.erro {
  color: #dc2626;
  font-size: 0.875rem;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { adicionarComentario, atualizarStatusChamado, buscarChamado } from '@/services/chamados'
import { useAuthStore } from '@/stores/auth'
import type { Chamado, StatusChamado } from '@/types'

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
  <div class="pagina">
    <RouterLink to="/" class="voltar">&larr; Voltar</RouterLink>

    <p v-if="carregando">Carregando...</p>
    <p v-else-if="erro && !chamado" class="erro">{{ erro }}</p>

    <template v-else-if="chamado">
      <header class="cabecalho">
        <h1>{{ chamado.titulo }}</h1>
        <span class="tag">{{ chamado.status }}</span>
        <span class="tag">{{ chamado.prioridade }}</span>
      </header>

      <p class="descricao">{{ chamado.descricao }}</p>

      <dl class="metadados">
        <dt>Solicitante</dt>
        <dd>{{ chamado.solicitante.nome }}</dd>
        <dt>Responsável</dt>
        <dd>{{ chamado.responsavel?.nome ?? '— não atribuído —' }}</dd>
        <dt>Categoria</dt>
        <dd>{{ chamado.categoria?.nome ?? '— sem categoria —' }}</dd>
      </dl>

      <div v-if="ehEquipeSuporte" class="controles">
        <label>
          Status
          <select :value="chamado.status" :disabled="atualizandoStatus" @change="mudarStatus(($event.target as HTMLSelectElement).value as StatusChamado)">
            <option v-for="opcao in opcoesStatus" :key="opcao" :value="opcao">{{ opcao }}</option>
          </select>
        </label>
      </div>

      <section class="comentarios">
        <h2>Comentários</h2>
        <ul>
          <li v-for="comentario in chamado.comentarios" :key="comentario.id">
            <strong>{{ comentario.autor.nome }}</strong>
            <p>{{ comentario.mensagem }}</p>
          </li>
        </ul>

        <form class="form-comentario" @submit.prevent="enviarComentario">
          <textarea v-model="novoComentario" rows="3" maxlength="2000" placeholder="Escreva um comentário..." required></textarea>
          <button type="submit" :disabled="enviandoComentario">
            {{ enviandoComentario ? 'Enviando...' : 'Comentar' }}
          </button>
        </form>
      </section>

      <p v-if="erro" class="erro">{{ erro }}</p>
    </template>
  </div>
</template>

<style scoped>
.pagina {
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.voltar {
  color: #2563eb;
  text-decoration: none;
  align-self: flex-start;
}

.cabecalho {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--color-background-mute);
}

.metadados {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
  font-size: 0.875rem;
}

.metadados dt {
  opacity: 0.6;
}

.controles select {
  padding: 0.4rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
}

.comentarios ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comentarios li {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.form-comentario {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-comentario textarea {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  font-family: inherit;
}

.form-comentario button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.erro {
  color: #dc2626;
}
</style>

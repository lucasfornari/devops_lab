<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { listarChamados } from '@/services/chamados'
import { useAuthStore } from '@/stores/auth'
import type { Chamado } from '@/types'

const auth = useAuthStore()
const chamados = ref<Chamado[]>([])
const carregando = ref(true)
const erro = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    chamados.value = await listarChamados()
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'não foi possível carregar os chamados'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="pagina">
    <header class="topo">
      <h1>Chamados</h1>
      <div class="acoes">
        <RouterLink to="/chamados/novo" class="botao">Novo chamado</RouterLink>
        <button class="link" @click="auth.logout()">Sair</button>
      </div>
    </header>

    <p v-if="carregando">Carregando...</p>
    <p v-else-if="erro" class="erro">{{ erro }}</p>
    <p v-else-if="chamados.length === 0">Nenhum chamado encontrado.</p>

    <ul v-else class="lista">
      <li v-for="chamado in chamados" :key="chamado.id">
        <RouterLink :to="`/chamados/${chamado.id}`" class="item">
          <span class="titulo">{{ chamado.titulo }}</span>
          <span class="tag" :class="`status-${chamado.status.toLowerCase()}`">{{ chamado.status }}</span>
          <span class="tag prioridade">{{ chamado.prioridade }}</span>
          <span class="solicitante">{{ chamado.solicitante.nome }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.pagina {
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.acoes {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.botao {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 600;
}

.link {
  background: transparent;
  border: none;
  color: #2563eb;
  cursor: pointer;
}

.lista {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  text-decoration: none;
  color: inherit;
  flex-wrap: wrap;
}

.titulo {
  font-weight: 600;
  flex: 1;
}

.tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--color-background-mute);
}

.solicitante {
  font-size: 0.8rem;
  opacity: 0.7;
}

.erro {
  color: #dc2626;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { atualizarUsuario, criarUsuario, excluirUsuario, listarUsuarios } from '@/services/usuarios'
import { useAuthStore } from '@/stores/auth'
import type { NovoUsuario, Papel, Usuario } from '@/types'
import { mensagemDeErro } from '@/utils/erros'
import { ROTULOS_PAPEL } from '@/utils/rotulos'
import AlertError from '@/components/AlertError.vue'
import AvatarIniciais from '@/components/AvatarIniciais.vue'
import UsuarioForm from '@/components/admin/UsuarioForm.vue'

const auth = useAuthStore()

const usuarios = ref<Usuario[]>([])
const busca = ref('')
const papel = ref<Papel | ''>('')
const formularioAberto = ref(false)
const emEdicao = ref<Usuario | null>(null)
const salvando = ref(false)
const erro = ref('')

const coresPapel: Record<Papel, string> = {
  USUARIO: 'bg-secondary-subtle text-secondary-emphasis',
  AGENTE: 'bg-info-subtle text-info-emphasis',
  ADMIN: 'bg-primary-subtle text-primary-emphasis',
}

async function carregar() {
  try {
    usuarios.value = await listarUsuarios({ busca: busca.value, papel: papel.value || undefined })
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível carregar os usuários')
  }
}

function abrirFormulario(usuario: Usuario | null) {
  emEdicao.value = usuario
  formularioAberto.value = true
}

function fecharFormulario() {
  emEdicao.value = null
  formularioAberto.value = false
}

async function executar(acao: () => Promise<unknown>) {
  salvando.value = true
  erro.value = ''
  try {
    await acao()
    fecharFormulario()
    await carregar()
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível salvar o usuário')
  } finally {
    salvando.value = false
  }
}

function salvar(dados: NovoUsuario) {
  if (!emEdicao.value) return executar(() => criarUsuario(dados))
  const id = emEdicao.value.id
  return executar(async () => {
    await atualizarUsuario(id, { ...dados, senha: dados.senha || undefined })
    if (id === auth.usuario?.id) await auth.carregarUsuarioAtual()
  })
}

function excluir(usuario: Usuario) {
  if (!confirm(`Excluir ${usuario.nome}? Essa ação não pode ser desfeita.`)) return
  return executar(() => excluirUsuario(usuario.id))
}

let esperaBusca: ReturnType<typeof setTimeout> | undefined
watch(busca, () => {
  clearTimeout(esperaBusca)
  esperaBusca = setTimeout(carregar, 300)
})
watch(papel, carregar, { immediate: true })
</script>

<template>
  <div class="card border-0 shadow-sm rounded-4">
    <div class="card-body p-4">
      <div class="d-flex flex-column flex-md-row gap-2 mb-4">
        <input
          v-model="busca"
          type="search"
          maxlength="160"
          placeholder="Buscar por nome ou email"
          aria-label="Buscar usuários"
          class="form-control rounded-pill"
        />
        <select v-model="papel" aria-label="Filtrar por papel" class="form-select rounded-pill" style="max-width: 14rem">
          <option value="">Todos os papéis</option>
          <option v-for="(rotulo, valor) in ROTULOS_PAPEL" :key="valor" :value="valor">{{ rotulo }}</option>
        </select>
        <button type="button" class="btn btn-primary rounded-pill px-4 text-nowrap" @click="abrirFormulario(null)">
          <i class="bi bi-person-plus me-1"></i>Novo usuário
        </button>
      </div>

      <div v-if="formularioAberto" class="border rounded-4 p-3 mb-4">
        <h2 class="h6 fw-bold mb-3">{{ emEdicao ? `Editar ${emEdicao.nome}` : 'Novo usuário' }}</h2>
        <UsuarioForm :usuario="emEdicao" :salvando="salvando" @salvar="salvar" @cancelar="fecharFormulario" />
      </div>

      <AlertError v-if="erro" :mensagem="erro" class="mb-3" />

      <p v-if="usuarios.length === 0" class="text-body-secondary small mb-0">Nenhum usuário encontrado.</p>
      <ul v-else class="list-group list-group-flush">
        <li v-for="usuario in usuarios" :key="usuario.id" class="list-group-item d-flex align-items-center gap-3 px-0">
          <AvatarIniciais :nome="usuario.nome" />
          <div class="me-auto" style="min-width: 0">
            <div class="fw-semibold text-truncate">
              {{ usuario.nome }}
              <span v-if="usuario.id === auth.usuario?.id" class="small text-body-secondary fw-normal">(você)</span>
            </div>
            <div class="small text-body-secondary text-truncate">{{ usuario.email }}</div>
          </div>
          <span class="badge rounded-pill d-none d-sm-inline" :class="coresPapel[usuario.papel]">
            {{ ROTULOS_PAPEL[usuario.papel] }}
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary rounded-pill"
            :aria-label="`Editar ${usuario.nome}`"
            @click="abrirFormulario(usuario)"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-danger rounded-pill"
            :aria-label="`Excluir ${usuario.nome}`"
            :disabled="salvando || usuario.id === auth.usuario?.id"
            @click="excluir(usuario)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

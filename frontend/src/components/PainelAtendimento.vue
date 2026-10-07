<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { atualizarResponsavelChamado, atualizarStatusChamado } from '@/services/chamados'
import { listarUsuarios } from '@/services/usuarios'
import { useAuthStore } from '@/stores/auth'
import type { Chamado, StatusChamado, Usuario } from '@/types'
import { mensagemDeErro } from '@/utils/erros'
import AlertError from '@/components/AlertError.vue'

const props = defineProps<{ chamado: Chamado }>()
const emit = defineEmits<{ atualizado: [chamado: Chamado] }>()

const auth = useAuthStore()
const atendentes = ref<Usuario[]>([])
const salvando = ref(false)
const erro = ref('')

const opcoesStatus: { valor: StatusChamado; rotulo: string }[] = [
  { valor: 'ABERTO', rotulo: 'Aberto' },
  { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
  { valor: 'RESOLVIDO', rotulo: 'Resolvido' },
  { valor: 'FECHADO', rotulo: 'Fechado' },
]

const souResponsavel = computed(() => props.chamado.responsavel?.id === auth.usuario?.id)

onMounted(async () => {
  if (!auth.ehAdmin) return
  const usuarios = await listarUsuarios().catch(() => [])
  atendentes.value = usuarios.filter((usuario) => usuario.papel !== 'USUARIO')
})

async function executar(acao: () => Promise<Chamado>) {
  salvando.value = true
  erro.value = ''
  try {
    emit('atualizado', await acao())
  } catch (e) {
    erro.value = mensagemDeErro(e, 'não foi possível atualizar o chamado')
  } finally {
    salvando.value = false
  }
}

function mudarStatus(status: StatusChamado) {
  return executar(() => atualizarStatusChamado(props.chamado.id, status))
}

function atribuirA(responsavelId: number) {
  return executar(() => atualizarResponsavelChamado(props.chamado.id, responsavelId))
}

function valorDe(evento: Event) {
  return (evento.target as HTMLSelectElement).value
}
</script>

<template>
  <div class="card border-0 shadow-sm rounded-4">
    <div class="card-body p-4 d-flex flex-column gap-3">
      <h2 class="h6 fw-bold mb-0"><i class="bi bi-tools me-2"></i>Atendimento</h2>

      <div>
        <label for="status" class="form-label small text-body-secondary mb-1">Status</label>
        <select
          id="status"
          :value="chamado.status"
          :disabled="salvando"
          class="form-select rounded-3"
          @change="mudarStatus(valorDe($event) as StatusChamado)"
        >
          <option v-for="opcao in opcoesStatus" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
        </select>
      </div>

      <div v-if="auth.ehAdmin">
        <label for="responsavel" class="form-label small text-body-secondary mb-1">Responsável</label>
        <select
          id="responsavel"
          :value="chamado.responsavel?.id ?? ''"
          :disabled="salvando"
          class="form-select rounded-3"
          @change="atribuirA(Number(valorDe($event)))"
        >
          <option value="" disabled>Selecione um atendente</option>
          <option v-for="atendente in atendentes" :key="atendente.id" :value="atendente.id">
            {{ atendente.nome }}
          </option>
        </select>
      </div>

      <button
        v-else-if="!souResponsavel && auth.usuario"
        type="button"
        class="btn btn-outline-primary rounded-pill"
        :disabled="salvando"
        @click="atribuirA(auth.usuario.id)"
      >
        <i class="bi bi-person-check me-1"></i>Assumir chamado
      </button>

      <AlertError v-if="erro" :mensagem="erro" />
    </div>
  </div>
</template>

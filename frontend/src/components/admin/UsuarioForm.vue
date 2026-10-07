<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NovoUsuario, Papel, Usuario } from '@/types'
import { ROTULOS_PAPEL } from '@/utils/rotulos'

const props = defineProps<{ usuario: Usuario | null; salvando: boolean }>()
const emit = defineEmits<{ salvar: [dados: NovoUsuario]; cancelar: [] }>()

const nome = ref('')
const email = ref('')
const senha = ref('')
const papel = ref<Papel>('USUARIO')

watch(
  () => props.usuario,
  (usuario) => {
    nome.value = usuario?.nome ?? ''
    email.value = usuario?.email ?? ''
    papel.value = usuario?.papel ?? 'USUARIO'
    senha.value = ''
  },
  { immediate: true },
)

function enviar() {
  emit('salvar', { nome: nome.value, email: email.value, senha: senha.value, papel: papel.value })
}
</script>

<template>
  <form class="row g-3" @submit.prevent="enviar">
    <div class="col-12 col-md-6">
      <label for="usuario-nome" class="form-label small fw-semibold">Nome</label>
      <input id="usuario-nome" v-model="nome" type="text" required maxlength="120" class="form-control rounded-3" />
    </div>
    <div class="col-12 col-md-6">
      <label for="usuario-email" class="form-label small fw-semibold">Email</label>
      <input id="usuario-email" v-model="email" type="email" required maxlength="160" class="form-control rounded-3" />
    </div>
    <div class="col-12 col-md-6">
      <label for="usuario-senha" class="form-label small fw-semibold">Senha</label>
      <input
        id="usuario-senha"
        v-model="senha"
        type="password"
        :required="!usuario"
        minlength="6"
        maxlength="72"
        :placeholder="usuario ? 'Deixe em branco para manter' : 'Mínimo de 6 caracteres'"
        autocomplete="new-password"
        class="form-control rounded-3"
      />
    </div>
    <div class="col-12 col-md-6">
      <label for="usuario-papel" class="form-label small fw-semibold">Papel</label>
      <select id="usuario-papel" v-model="papel" class="form-select rounded-3">
        <option v-for="(rotulo, valor) in ROTULOS_PAPEL" :key="valor" :value="valor">{{ rotulo }}</option>
      </select>
    </div>
    <div class="col-12 d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-light rounded-pill px-4" @click="emit('cancelar')">Cancelar</button>
      <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="salvando">
        <i class="bi bi-check-lg me-1"></i>{{ usuario ? 'Salvar alterações' : 'Criar usuário' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
defineProps<{ enviando: boolean }>()
const emit = defineEmits<{ enviar: [] }>()
const mensagem = defineModel<string>({ required: true })
</script>

<template>
  <form class="d-flex flex-column gap-2" @submit.prevent="emit('enviar')">
    <textarea
      v-model="mensagem"
      rows="3"
      maxlength="2000"
      placeholder="Escreva um comentário..."
      required
      class="form-control"
    ></textarea>
    <div>
      <button type="submit" class="btn btn-primary" :disabled="enviando">
        {{ enviando ? 'Enviando...' : 'Comentar' }}
      </button>
    </div>
  </form>
</template>

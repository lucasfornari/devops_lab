<script setup lang="ts">
defineProps<{ enviando: boolean }>()
const emit = defineEmits<{ enviar: [] }>()
const mensagem = defineModel<string>({ required: true })
</script>

<template>
  <form class="mt-2 flex flex-col gap-2" @submit.prevent="emit('enviar')">
    <textarea
      v-model="mensagem"
      rows="3"
      maxlength="2000"
      placeholder="Escreva um comentário..."
      required
      class="form-control"
    ></textarea>
    <button type="submit" class="btn-primary self-start" :disabled="enviando">
      {{ enviando ? 'Enviando...' : 'Comentar' }}
    </button>
  </form>
</template>

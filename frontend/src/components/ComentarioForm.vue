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
      class="form-control rounded-3"
    ></textarea>
    <div class="text-end">
      <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="enviando">
        <i class="bi bi-send me-1"></i>{{ enviando ? 'Enviando...' : 'Comentar' }}
      </button>
    </div>
  </form>
</template>

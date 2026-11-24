<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })
const senha = defineModel<string>({ required: true })
const visivel = ref(false)
</script>

<template>
  <input v-bind="$attrs" v-model="senha" :type="visivel ? 'text' : 'password'" class="form-control" />
  <button
    type="button"
    class="btn border"
    :aria-label="visivel ? 'Ocultar senha' : 'Mostrar senha'"
    :title="visivel ? 'Ocultar senha' : 'Mostrar senha'"
    @click="visivel = !visivel"
  >
    <i class="bi" :class="visivel ? 'bi-eye-slash' : 'bi-eye'"></i>
  </button>
</template>

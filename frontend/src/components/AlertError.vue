<script setup lang="ts">
defineProps<{ mensagem: string }>()
</script>

<template>
  <p class="alert-error">{{ mensagem }}</p>
</template>

<script setup lang="ts">
defineProps<{ mensagem: string }>()
</script>

<template>
  <div class="alert alert-danger d-flex align-items-center gap-2 py-2 mb-0 rounded-3" role="alert">
    <i class="bi bi-exclamation-circle"></i>
    <span>{{ mensagem }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ mensagem: string }>()
</script>

<template>
  <div class="alert alert-danger py-2 mb-0" role="alert">{{ mensagem }}</div>
</template>

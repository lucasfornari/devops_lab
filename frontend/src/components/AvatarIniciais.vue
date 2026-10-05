<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ nome: string; tamanho?: number }>(), { tamanho: 36 })

const iniciais = computed(() =>
  props.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join(''),
)
</script>

<template>
  <span
    class="icone-redondo bg-primary-subtle text-primary-emphasis"
    :style="{ width: `${tamanho}px`, height: `${tamanho}px`, fontSize: `${tamanho * 0.38}px` }"
  >
    {{ iniciais }}
  </span>
</template>

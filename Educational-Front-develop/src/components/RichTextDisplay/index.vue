<template>
  <div>{{ plainText }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { stripHtmlTags } from '@/utils';

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
});

const plainText = computed(() => stripHtmlTags(props.content));
</script>
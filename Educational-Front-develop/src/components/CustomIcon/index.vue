<template>
  <img 
    v-if="iconUrl" 
    :src="iconUrl" 
    :alt="name"
    :style="{ width: size + 'px', height: size + 'px' }"
    :class="className"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIconUrl } from '@/utils/icons'

interface Props {
  name: string
  size?: number
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  className: ''
})

const iconUrl = computed(() => getIconUrl(props.name))
</script>

<style scoped>
img {
  display: inline-block;
  vertical-align: middle;
}
</style> 
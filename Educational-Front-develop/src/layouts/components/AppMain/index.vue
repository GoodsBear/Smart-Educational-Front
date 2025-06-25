<template>
  <section class="app-main" :style="{ height: appMainHeight }">
    <!-- 直接渲染路由组件，不使用keepAlive和transition，以便排查问题 -->
    <router-view />
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";
import variables from "@/styles/variables.module.scss";

// 设置主内容区高度
const appMainHeight = computed(() => {
  if (useSettingsStore().showTagsView) {
    return `calc(100vh - ${variables["navbar-height"]} - ${variables["tags-view-height"]})`;
  } else {
    return `calc(100vh - ${variables["navbar-height"]})`;
  }
});
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
  padding: 16px; /* 添加一些内边距 */

  /* 布局切换动画优化 */
  &.animate__animated {
    animation-duration: 0.4s;
    animation-fill-mode: forwards;
  }

  &.animate__fadeOut {
    animation-timing-function: ease-in;
  }

  &.animate__fadeIn {
    animation-timing-function: ease-out;
  }
}
</style>

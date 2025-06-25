<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- 开启水印 -->
    <el-watermark
      :font="{ color: fontColor }"
      :content="showWatermark ? defaultSettings.watermarkContent : ''"
      :z-index="9999"
      class="wh-full"
    >
      <router-view />
    </el-watermark>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore } from "@/store";
import { defaultSettings } from "@/settings";
import { ThemeMode } from "@/enums/settings/theme.enum";
import { ComponentSize } from "@/enums/settings/layout.enum";

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as ComponentSize);
const showWatermark = computed(() => settingsStore.showWatermark);

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === ThemeMode.DARK ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  width: 220px;
  background-color: #f9f9f9;
  border-right: 1px solid #dcdfe6;
  overflow-y: auto;
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.welcome-text h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.welcome-text p {
  margin: 0;
  color: #909399;
}

.stat-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

.data-table-card {
  margin-bottom: 20px;
}
</style>

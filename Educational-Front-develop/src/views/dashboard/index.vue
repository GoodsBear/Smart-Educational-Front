<template>
  <div class="dashboard-container">
    <!-- github 角标 -->
    <!-- <github-corner class="github-corner" /> -->

    <el-card shadow="never" class="mt-2">
      <div class="flex flex-wrap">
        <!-- 左侧问候语区域 -->
        <div class="flex-1 flex items-start">
          <img class="w80px h80px rounded-full" :src="staffInfo.PhotoUrl" />
          <div class="ml-5">
            <p class="text-lg font-bold">欢迎使用智慧教务系统！</p>
            {{ staffInfo.StaffName }}
            <p class="text-sm text-gray">今日天气晴朗，气温在15℃至25℃之间，东南风。</p>
          </div>
        </div>

        <!-- 右侧图标区域 - PC端 -->
        <div class="hidden sm:block">
          <div class="flex items-end space-x-6">
            <!-- 仓库 -->
            <div>
              <div class="font-bold color-#ff9a2e text-sm flex items-center">
                <el-icon class="mr-2px">
                  <Folder />
                </el-icon>
                仓库
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://gitee.com" target="_blank">
                  <div class="i-svg:gitee text-lg color-#F76560" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://github.com" target="_blank">
                  <div class="i-svg:github text-lg color-#4080FF" />
                </el-link>
              </div>
            </div>

            <!-- 文档 -->
            <div>
              <div class="font-bold color-#4080ff text-sm flex items-center">
                <el-icon class="mr-2px">
                  <Document />
                </el-icon>
                文档
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://juejin.cn" target="_blank">
                  <div class="i-svg:juejin text-lg" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://blog.csdn.net" target="_blank">
                  <div class="i-svg:csdn text-lg" />
                </el-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 数据统计 -->
    <el-row :gutter="10" class="mt-5">
      <!-- 在线用户数量 -->
      <el-col :span="8" :xs="24" class="mb-xs-3">
        <el-card shadow="never" class="h-full flex flex-col">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">在线用户</span>
              <el-tag type="danger" size="small">实时</el-tag>
            </div>
          </template>

          <div class="flex-x-between mt-2 flex-1">
            <div class="flex-y-center">
              <span class="text-lg transition-all duration-300 hover:scale-110">128</span>
              <span class="ml-2 text-xs text-[#67c23a]">
                <el-icon>
                  <Connection />
                </el-icon>
                已连接
              </span>
            </div>
            <div class="i-svg:people w-8 h-8 animate-[pulse_2s_infinite]" />
          </div>

          <div class="flex-x-between mt-2 text-sm text-gray">
            <span>更新时间</span>
            <span>{{ new Date().toLocaleTimeString() }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 访客数(UV) -->
      <el-col :span="8" :xs="24" class="mb-xs-3">
        <el-card shadow="never" class="h-full flex flex-col">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">访客数(UV)</span>
              <el-tag type="success" size="small">日</el-tag>
            </div>
          </template>

          <div class="flex-x-between mt-2 flex-1">
            <div class="flex-y-center">
              <span class="text-lg">150</span>
              <span class="text-xs ml-2 text-[--el-color-success]">
                <el-icon>
                  <Top />
                </el-icon>
                +15%
              </span>
            </div>
            <div class="i-svg:visitor w-8 h-8" />
          </div>

          <div class="flex-x-between mt-2 text-sm text-gray">
            <span>总访客数</span>
            <span>1,500</span>
          </div>
        </el-card>
      </el-col>

      <!-- 浏览量(PV) -->
      <el-col :span="8" :xs="24">
        <el-card shadow="never" class="h-full flex flex-col">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">浏览量(PV)</span>
              <el-tag type="primary" size="small">日</el-tag>
            </div>
          </template>

          <div class="flex-x-between mt-2 flex-1">
            <div class="flex-y-center">
              <span class="text-lg">300</span>
              <span class="text-xs ml-2 text-[--el-color-success]">
                <el-icon>
                  <Top />
                </el-icon>
                +20%
              </span>
            </div>
            <div class="i-svg:view w-8 h-8" />
          </div>

          <div class="flex-x-between mt-2 text-sm text-gray">
            <span>总浏览量</span>
            <span>3,000</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Connection } from "@element-plus/icons-vue";
import { Document, Top } from "@element-plus/icons-vue";
import { ref, onMounted } from "vue";

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

const staffInfo = ref({
  PhotoUrl: "",
  StaffName: "",
  // 你还可以加其他字段
});

onMounted(() => {
  const infoStr = localStorage.getItem("staffInfo");
  if (infoStr) {
    try {
      const info = JSON.parse(infoStr);
      staffInfo.value = info;
    } catch {
      staffInfo.value = { PhotoUrl: "", StaffName: "" };
    }
  }
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }
}
</style>

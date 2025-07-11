<template>
  <div class="holiday-page">
    <!-- 左侧：已设置节假日 -->
    <div class="holiday-list">
      <div class="list-title">已设置节假日</div>
      <ul class="holiday-ul">
        <li v-for="date in holidayList" :key="date" class="holiday-li">
          <span class="holiday-date">{{ date }}</span>
          <el-button
            size="small"
            type="text"
            @click="removeHoliday(date)"
          >删除
        </el-button>
        </li>
      </ul>
    </div>

    <!-- 右侧：年份选择和日历 -->
    <div class="calendar-area">
      <div class="block">
        <span class="demonstration">选择年份:</span>
        <el-date-picker
          v-model="selectedYear"
          type="year"
          placeholder="Pick a year"
        />
      </div>
      <div class="calendar">
        <Calendar/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Calendar from '@/components/Calendar/Calendar.vue'

// 节假日列表（静态模拟，后续可对接数据库）
const holidayList = ref<string[]>([
  '2024-01-01',
  '2024-02-10',
  '2024-04-05',
  '2024-05-01',
  '2024-10-01',
])

// 当前选中的年份，默认为今年
const selectedYear = ref<number>(new Date().getTime())

// 删除节假日
function removeHoliday(date: string) {
  holidayList.value = holidayList.value.filter(d => d !== date)
}

// 获取某年某月的1号日期对象
function getMonthDate(year: number, month: number): Date {
  return new Date(year, month - 1, 1)
}
</script>

<style scoped>
/*左侧样式*/
.holiday-page {
  /* 页面主容器，左右分栏布局 */
  display: flex;
  gap: 24px; /* 左右间距 */
  align-items: flex-start;
  padding: 16px 16px 0 16px; /* 页面内边距 */
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.holiday-list {
  /* 左侧节假日列表容器 */
  width: 200px;
  min-width: 140px;
  background: #fafbfc;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 1px 4px #eee;
}
.list-title {
  /* 节假日列表标题 */
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 15px;
}
.holiday-ul {
  /* 节假日列表ul样式，去除默认样式 */
  list-style: none;
  padding: 0;
  margin: 0;
}
.holiday-li {
  /* 节假日每一项，左右分布，带删除按钮 */
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  justify-content: space-between;
}
.holiday-date {
  /* 节假日日期文本样式 */
  font-size: 14px;
  color: #333;
}
/*右侧样式 */



</style>
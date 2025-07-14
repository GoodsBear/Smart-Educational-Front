<template>
  <div class="year-calendar-container">
    <div class="calendar-grid">
      <!-- 12个月的日历 -->
      <div v-for="month in 12" :key="month" class="month-calendar">
        <el-calendar
          :model-value="getMonthDate(selectedYear, month)"
          :fullscreen="false"
          class="mini-calendar"
        >
          <!-- 自定义日期单元格 -->
          <template #date-cell="{ data }">
            <div 
              class="custom-date-cell"
              :class="{
                'holiday': isHoliday(data.day, month)
              }"
            >
              {{ data.day.split('-')[2] }}
            </div>
          </template>
        </el-calendar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 定义props，接收选中的年份
interface Props {
  selectedYear: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedYear: new Date().getFullYear()
})

// 假设的节假日数据(可以根据年份动态获取)
const holidays = [
  { day: '2024-01-01', name: '元旦' },
  { day: '2024-02-10', name: '春节' },
  { day: '2024-04-05', name: '清明节' },
  { day: '2024-05-01', name: '劳动节' },
  { day: '2024-10-01', name: '国庆节' },
  // 可以添加更多年份的节假日数据...
];

// 获取指定年月的日期对象
const getMonthDate = (year: number, month: number): Date => {
  return new Date(year, month - 1, 1);
};

// 判断是否是节假日
const isHoliday = (day: string, month: number): boolean => {
  const year = props.selectedYear;
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return holidays.some(holiday => holiday.day === dateStr);
};
</script>

<style scoped>
.year-calendar-container {
  font-family: Arial, sans-serif;         /* 设置字体为 Arial，提升可读性 */
  max-width: 1200px;                      /* 最大宽度为1200px，防止内容过宽 */
  margin: 0 auto;                         /* 水平居中容器 */
  padding: 20px;                          /* 容器内边距20px */
}

.calendar-grid {
  display: grid;                          /* 使用CSS网格布局 */
  grid-template-columns: repeat(4, 1fr);  /* 4列等宽，每列1fr */
  gap: 20px;                              /* 网格项之间的间距为20px */
}

.month-calendar {
  border: 1px solid #e0e0e0;              /* 灰色边框，分隔每个月份 */
  border-radius: 4px;                     /* 边角圆润，半径4px */
  overflow: hidden;                       /* 内容溢出隐藏，防止圆角被破坏 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 轻微阴影，提升层次感 */
}

.month-title {
  background-color: #f5f7fa;              /* 浅灰色背景，区分标题栏 */
  padding: 10px 15px;                     /* 上下10px，左右15px内边距 */
  font-size: 16px;                        /* 字体大小16px */
  font-weight: bold;                      /* 字体加粗 */
  text-align: center;                     /* 文字居中 */
  border-bottom: 1px solid #e0e0e0;       /* 底部分割线，和内容区分 */
}

/* 应用自定义样式到迷你日历的日期单元格 */
:deep(.mini-calendar .el-calendar-table__row td) {
  height: 20px !important;                /* 单元格高度20px，保证紧凑 */
  min-height: 20px !important;            /* 最小高度20px，防止内容溢出 */
  line-height: 20px !important;           /* 行高20px，数字垂直居中 */
  padding: 0 !important;                  /* 去除内边距，格子更紧凑 */
  border: 1px solid #e0e0e0 !important;   /* 灰色边框，分隔每一天 */
  box-sizing: border-box;                 /* 包含边框和内边距在宽高内 */
}

/* 可选：为日历中的每一天设置高度和行高，保证数字垂直居中 */
:deep(.mini-calendar .el-calendar-day) {
  height: 20px;                           /* 日历天格高度20px */
  line-height: 20px;                      /* 行高20px，数字垂直居中 */
}

/* 为"今天"高亮显示，蓝色背景和文字 */
:deep(.mini-calendar .el-calendar-day.today) {
  background-color: #1635e4 !important;              /* 今天的背景色为浅蓝色 */
  color: #fff !important;                         /* 今天的文字为蓝色 */
  font-weight: bold;                      /* 今天的日期加粗 */
}

/* 自定义日期单元格内容的样式，居中显示 */
:deep(.custom-date-cell) {
  height: 100%;                           /* 高度占满父容器 */
  display: flex;                          /* 使用flex布局 */
  align-items: center;                    /* 垂直居中内容 */
  justify-content: center;                /* 水平居中内容 */
}

/* 节假日单元格高亮，浅蓝色背景、蓝色文字、圆形 */
:deep(.custom-date-cell.holiday) {
  background-color: #e6f7ff;              /* 浅蓝色背景，突出节假日 */
  color: #1890ff;                         /* 蓝色文字 */
  font-weight: bold;                      /* 节假日日期加粗 */
  border-radius: 50%;                     /* 圆形背景 */
}

/* 隐藏日历头部的导航按钮（如"今天"、"上月"、"下月"） */
:deep(.mini-calendar .el-calendar__button-group) {
  display: none !important;               /* 隐藏按钮组 */
}

</style>
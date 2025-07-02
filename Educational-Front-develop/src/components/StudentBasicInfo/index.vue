<template>
  <div class="student-basic-info">
    <div class="student-header">
      <div class="avatar">
        <el-avatar :size="64" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
      </div>
      <div class="student-name">{{ studentInfo.name }}</div>
      <div class="student-phone">{{ studentInfo.phone }}</div>
      <div class="score-info">
        <span>剩余课时: {{ studentInfo.lessonNums || 0 }}</span>
        <span>积分: {{ studentInfo.score || 0 }}</span>
      </div>
    </div>

    <div class="info-list">
      <div class="info-item">
        <span class="label">阶段:</span>
        <span class="value">{{ getStudentType(studentInfo.studentType) }}</span>
      </div>
      <div class="info-item">
        <span class="label">性别:</span>
        <span class="value">{{ studentInfo.sex === 0 ? '男' : '女' }}</span>
      </div>
      <div class="info-item">
        <span class="label">年龄:</span>
        <span class="value">{{ studentInfo.age || 0 }}</span>
      </div>
      <div class="info-item">
        <span class="label">出生年月:</span>
        <span class="value">{{ studentInfo.birthday }}</span>
      </div>
      <div class="info-item">
        <span class="label">身份证号码:</span>
        <span class="value">{{ studentInfo.idCard }}</span>
      </div>
      <div class="info-item">
        <span class="label">家长姓名:</span>
        <span class="value">{{ studentInfo.parentName }}</span>
      </div>
      <div class="info-item">
        <span class="label">亲属关系:</span>
        <span class="value">{{ getRelation(studentInfo.relation) }}</span>
      </div>
      <div class="info-item">
        <span class="label">年级:</span>
        <span class="value">{{ studentInfo.gradeName }}</span>
      </div>
      <div class="info-item">
        <span class="label">入学时间:</span>
        <span class="value">{{ studentInfo.enrollTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">加入时间:</span>
        <span class="value">{{ studentInfo.createTime }}</span>
      </div>
    </div>

    <div class="info-section">
      <div class="section-title">备注</div>
      <div class="section-content">{{ studentInfo.remark || '暂无备注' }}</div>
    </div>

    <div class="info-section">
      <div class="section-title">课时进度</div>
      <div class="section-content">
        <!-- 这里可以添加课时进度相关的内容 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  studentInfo: any
}>()

// 获取学员类型
const getStudentType = (type: number) => {
  const typeMap: Record<number, string> = {
    0: '在学学员',
    1: '意向学员',
    2: '结业学员'
  }
  return typeMap[type] || '未知'
}

// 获取亲属关系
const getRelation = (relation: number) => {
  const relationMap: Record<number, string> = {
    0: '爸爸',
    1: '妈妈',
    2: '爷爷',
    3: '奶奶',
    4: '姥爷',
    5: '姥姥',
    6: '姑姑',
    7: '其他'
  }
  return relationMap[relation] || '未知'
}
</script>

<style scoped>
.student-basic-info {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.student-header {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  margin-bottom: 10px;
}

.student-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.student-phone {
  color: #666;
  margin-bottom: 10px;
}

.score-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #409EFF;
}

.info-list {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  line-height: 24px;
}

.label {
  color: #666;
  width: 100px;
  text-align: right;
  padding-right: 10px;
}

.value {
  flex: 1;
  color: #333;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}

.section-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  min-height: 60px;
}
</style> 
<template>
  <div>
    <el-card>
      <el-table :data="evaluationList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentName" label="学员" />
        <el-table-column prop="teacherName" label="老师" />
        <el-table-column prop="courseName" label="课次标题" />
        <el-table-column prop="comprehensive" label="综合评分">
          <template #default="{ row }">
            <el-rate :model-value="row.comprehensive" :max="5" disabled :show-score="false" />
          </template>
        </el-table-column>
        <el-table-column prop="atmosphere" label="课堂气氛">
          <template #default="{ row }">
            <el-rate :model-value="row.atmosphere" :max="5" disabled :show-score="false" />
          </template>
        </el-table-column>
        <el-table-column prop="teachingAttitude" label="授课态度">
          <template #default="{ row }">
            <el-rate :model-value="row.teachingAttitude" :max="5" disabled :show-score="false" />
          </template>
        </el-table-column>
        <el-table-column prop="teachingResult" label="教学效果">
          <template #default="{ row }">
            <el-rate :model-value="row.teachingResult" :max="5" disabled :show-score="false" />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" />
        <el-table-column label="评价时间">
          <template #default="{ row }">
            {{ moment(row.createTime).format("YYYY-MM-DD") }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import EvaluationAPI from "@/api/Evaluation/evaluation.api";
import moment from "moment";

const evaluationList = ref([]);

onMounted(async () => {
  const res = await EvaluationAPI.getEvaluationList();
  evaluationList.value = res;
});
</script>

<style scoped></style>
